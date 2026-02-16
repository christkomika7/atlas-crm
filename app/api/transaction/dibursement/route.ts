import { FISCAL_NATURE } from "@/config/constant";
import { formatNumber } from "@/lib/utils";
import { dibursementSchema, DibursementSchemaType } from "@/lib/zod/dibursement.schema";
import { type NextRequest, NextResponse } from "next/server"
import { checkAccess, sessionAccess } from "@/lib/access"
import { parseData } from "@/lib/parse";

import prisma from "@/lib/prisma";
import Decimal from "decimal.js";

export async function POST(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE"]);
    const { isAdmin, userId } = await sessionAccess();

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId as string } })

    if (!user) return NextResponse.json({
        state: "error",
        message: "Utlisateur non trouvé."
    }, { status: 400 });

    const res = await req.json();


    const data = parseData<DibursementSchemaType>(dibursementSchema, {
        ...res,
        date: new Date(res.date),
    }) as DibursementSchemaType;



    const companyExist = await prisma.company.findUnique({ where: { id: data.companyId } });

    if (!companyExist) {
        return NextResponse.json(
            { status: "error", message: "Identifiant invalide" },
            { status: 404 }
        );
    }

    const [category, nature, source] = await prisma.$transaction([
        prisma.transactionCategory.findUnique({ where: { id: data.category } }),
        prisma.transactionNature.findUnique({ where: { id: data.nature } }),
        prisma.source.findUnique({ where: { id: data.source } })
    ]);

    if (!category) {
        return NextResponse.json(
            { status: "error", message: "Catégorie invalide" },
            { status: 404 }
        );
    }

    if (!data.userAction) {
        return NextResponse.json(
            { status: "error", message: "La valeur du Client | Fournisseur | Tiers est requise" },
            { status: 404 }
        );
    }

    if (nature?.name === FISCAL_NATURE && !data.fiscalObject) {
        return NextResponse.json(
            { status: "error", message: "L'objet de paiement est obligatoire" },
            { status: 400 }
        );
    }

    const referenceDocument: Record<string, any> = {};

    if (data.fiscalObject) {
        Object.assign(referenceDocument, {
            fiscalObject: { connect: { id: data.fiscalObject } },
        });
    }


    if (data.documentRef) {
        Object.assign(referenceDocument, {
            referencePurchaseOrder: { connect: { id: data.documentRef } },
        });
    }


    if (data.project) {
        Object.assign(referenceDocument, {
            project: { connect: { id: data.project } },
        });
    }

    try {
        let paymentId = "";
        if (data.documentRef) {
            const purchaseOrderId = data.documentRef;

            const purchaseExist = await prisma.purchaseOrder.findUnique({
                where: { id: purchaseOrderId },
                select: {
                    id: true,
                    amountType: true,
                    payee: true,
                    totalTTC: true,
                    totalHT: true,
                    isPaid: true,
                    company: { select: { id: true, currency: true } },
                },
            });

            if (!purchaseExist) {
                return NextResponse.json({
                    status: "error",
                    message: "Identifiant du bon de commande invalide.",
                }, { status: 400 });
            }

            if (purchaseExist.isPaid) {
                return NextResponse.json({
                    status: "error",
                    message: "Ce bon de commande a déjà réglée et ne peut pas recevoir de nouveau paiement.",
                }, { status: 400 });
            }

            const total =
                purchaseExist.amountType === "HT"
                    ? purchaseExist.totalHT
                    : purchaseExist.totalTTC;

            const payee = purchaseExist.payee;
            const remaining = total.minus(payee);
            const newAmount = new Decimal(data.amount);

            if (newAmount.gt(remaining.valueOf())) {
                return NextResponse.json({
                    status: "error",
                    message: `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining.toString()
                    )} ${purchaseExist.company.currency}).`,
                }, { status: 400 });
            }

            const hasCompletedPayment = payee.add(newAmount.valueOf()).gte(total.minus(0.01));

            if (!isAdmin) {
                const newDibursement = await prisma.dibursementData.create({
                    data: {
                        date: data.date,
                        category: data.category,
                        nature: data.nature,
                        amount: data.amount,
                        amountType: data.amountType,
                        period: data.period,
                        paymentType: data.paymentMode,
                        checkNumber: data.checkNumber,
                        purchaseOrder: data.documentRef,
                        source: data.source,
                        project: data.project,
                        fiscalObject: data.fiscalObject,
                        infos: data.information,
                        userAction: {
                            connect: {
                                id: data.userAction as string
                            }
                        }
                    }
                });
                await prisma.notification.create({
                    data: {
                        type: 'CONFIRM',
                        for: 'DISBURSEMENT',
                        message: `${user.name} a initié un décaissement de ${formatNumber(data.amount)} ${companyExist.currency}, au titre de la catégorie « ${category.name} » (motif : ${nature?.name}), depuis le compte « ${source?.name} », actuellement en attente de validation.
                        \nCommentaire : \n
                        ${data.information}
                        `,
                        dibursement: {
                            connect: { id: newDibursement.id }
                        },
                        company: {
                            connect: { id: data.companyId }
                        }
                    }
                });

                return NextResponse.json({
                    status: "success",
                    message: "Votre requête est en attente de validation.",
                });
            }

            const newPayment = await prisma.payment.create({
                data: {
                    createdAt: data.date,
                    amount: String(data.amount),
                    paymentMode: data.paymentMode,
                    infos: data.information,
                    purchaseOrder: { connect: { id: purchaseOrderId } },
                },
            });

            paymentId = newPayment.id;

            const purchaseOrder = await prisma.purchaseOrder.update({
                where: { id: purchaseOrderId },
                data: {
                    isPaid: hasCompletedPayment,
                    payee: payee.add(newAmount.valueOf()),
                },
                include: {
                    supplier: true
                }

            });

            if (purchaseOrder.supplierId) {
                await prisma.supplier.update({
                    where: { id: purchaseOrder.supplierId },
                    data: {
                        due: { decrement: data.amount },
                        paidAmount: { increment: data.amount }
                    }
                })
            }
        }

        if (!isAdmin) {
            const newDibursement = await prisma.dibursementData.create({
                data: {
                    date: data.date,
                    category: data.category,
                    nature: data.nature,
                    amount: data.amount,
                    amountType: data.amountType,
                    period: data.period || "-",
                    paymentType: data.paymentMode,
                    checkNumber: data.checkNumber,
                    purchaseOrder: data.documentRef,
                    source: data.source,
                    project: data.project,
                    fiscalObject: data.fiscalObject,
                    infos: data.information,
                    userAction: {
                        connect: {
                            id: data.userAction
                        }
                    }
                }
            });

            await prisma.notification.create({
                data: {
                    type: 'CONFIRM',
                    for: 'DISBURSEMENT',
                    message: `${user.name} a initié un décaissement de ${formatNumber(data.amount)} ${companyExist.currency}, au titre de la catégorie « ${category.name} » (motif : ${nature?.name}), depuis le compte « ${source?.name} », actuellement en attente de validation.
                    \nCommentaire : \n
                    ${data.information}
                    `,
                    dibursement: {
                        connect: { id: newDibursement.id }
                    },
                    company: {
                        connect: { id: data.companyId }
                    }
                }
            });

            return NextResponse.json({
                status: "success",
                message: "Votre requête est en attente de validation.",
            });
        }


        if (paymentId) {
            Object.assign(referenceDocument, {
                payment: { connect: { id: paymentId } },
            });
        }

        const createdDibursement = await prisma.dibursement.create({
            data: {
                type: "DISBURSEMENT",
                date: data.date,
                movement: "OUTFLOWS",
                amount: String(data.amount),
                period: data.period,
                amountType: data.amountType,
                paymentType: data.paymentMode,
                checkNumber: data.checkNumber,
                infos: data.information,
                userAction: {
                    connect: {
                        id: data.userAction
                    }
                },
                category: { connect: { id: data.category } },
                source: { connect: { id: data.source } },
                nature: { connect: { id: data.nature } },
                company: { connect: { id: data.companyId } },
                ...referenceDocument,
            },
        });

        await prisma.notification.create({
            data: {
                type: 'ALERT',
                for: 'DISBURSEMENT',
                message: `${user.name} a réalisé un décaissement de ${formatNumber(data.amount)} ${companyExist.currency}, au titre de la catégorie « ${category.name} » (motif : ${nature?.name}), depuis le compte « ${source?.name} ».
                \nCommentaire : \n
                ${data.information}
                `,
                paymentDibursement: {
                    connect: { id: createdDibursement.id }
                },
                company: {
                    connect: { id: createdDibursement.companyId }
                }
            }
        });

        return NextResponse.json({
            status: "success",
            message: "Le décaissement crée avec succès.",
            data: createdDibursement,
        });
    } catch (error: any) {
        console.error("Error creating disbursement:", error);
        const isClientError = error instanceof Error && (
            /Identifiant|dépasse|déjà réglé|obligatoire/i.test(error.message)
        );

        const status = isClientError ? 400 : 500;
        const message = error instanceof Error ? error.message : "Erreur lors de la création de décaissement.";

        return NextResponse.json(
            { status: "error", message },
            { status }
        );
    }
}
