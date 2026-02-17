import { FISCAL_NATURE } from "@/config/constant";
import { formatNumber } from "@/lib/utils";
import { dibursementSchema, DibursementSchemaType } from "@/lib/zod/dibursement.schema";
import { type NextRequest, NextResponse } from "next/server"
import { checkAccess, sessionAccess } from "@/lib/access"
import { parseData } from "@/lib/parse";

import prisma from "@/lib/prisma";
import Decimal from "decimal.js";

export async function PUT(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["MODIFY"]);
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
        message: "Utilisateur non trouvé."
    }, { status: 400 });

    const res = await req.json();

    // Validation de l'ID du décaissement
    if (!res.id) {
        return NextResponse.json({
            state: "error",
            message: "L'identifiant du décaissement est requis."
        }, { status: 400 });
    }

    const data = parseData<DibursementSchemaType>(dibursementSchema, {
        ...res,
        date: new Date(res.date),
    }) as DibursementSchemaType;

    // Vérifier si le décaissement existe
    const existingDibursement = await prisma.dibursement.findUnique({
        where: { id: res.id },
        include: {
            payment: true,
            referencePurchaseOrder: true
        }
    });

    if (!existingDibursement) {
        return NextResponse.json({
            state: "error",
            message: "Décaissement non trouvé."
        }, { status: 404 });
    }

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
    } else {
        Object.assign(referenceDocument, {
            fiscalObject: { disconnect: true },
        });
    }

    if (data.documentRef) {
        Object.assign(referenceDocument, {
            referencePurchaseOrder: { connect: { id: data.documentRef } },
        });
    } else {
        Object.assign(referenceDocument, {
            referencePurchaseOrder: { disconnect: true },
        });
    }

    if (data.project) {
        Object.assign(referenceDocument, {
            project: { connect: { id: data.project } },
        });
    } else {
        Object.assign(referenceDocument, {
            project: { disconnect: true },
        });
    }

    try {
        let paymentId = existingDibursement.paymentId;

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
                    supplierId: true,
                    company: { select: { id: true, currency: true } },
                },
            });

            if (!purchaseExist) {
                return NextResponse.json({
                    status: "error",
                    message: "Identifiant du bon de commande invalide.",
                }, { status: 400 });
            }

            const total =
                purchaseExist.amountType === "HT"
                    ? purchaseExist.totalHT
                    : purchaseExist.totalTTC;

            const oldAmount = new Decimal(existingDibursement.amount.toString());
            const newAmount = new Decimal(data.amount);
            const amountDifference = newAmount.minus(oldAmount);

            // Restaurer l'ancien montant si on change de bon de commande
            if (existingDibursement.referencePurchaseOrderId && existingDibursement.referencePurchaseOrderId !== purchaseOrderId) {
                const oldPurchaseOrder = await prisma.purchaseOrder.findUnique({
                    where: { id: existingDibursement.referencePurchaseOrderId }
                });

                if (oldPurchaseOrder) {
                    await prisma.purchaseOrder.update({
                        where: { id: existingDibursement.referencePurchaseOrderId },
                        data: {
                            payee: oldPurchaseOrder.payee.minus(oldAmount.toString()),
                            isPaid: false
                        }
                    });

                    if (oldPurchaseOrder.supplierId) {
                        await prisma.supplier.update({
                            where: { id: oldPurchaseOrder.supplierId },
                            data: {
                                due: { increment: oldAmount.toNumber() },
                                paidAmount: { decrement: oldAmount.toNumber() }
                            }
                        });
                    }
                }
            }

            const currentPayee = existingDibursement.referencePurchaseOrderId === purchaseOrderId
                ? purchaseExist.payee.minus(oldAmount.toString())
                : purchaseExist.payee;

            const remaining = total.minus(currentPayee);

            if (newAmount.gt(remaining.valueOf())) {
                return NextResponse.json({
                    status: "error",
                    message: `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining.toString()
                    )} ${purchaseExist.company.currency}).`,
                }, { status: 400 });
            }

            const hasCompletedPayment = currentPayee.add(newAmount.valueOf()).gte(total.minus(0.01));

            // Mettre à jour ou créer le paiement
            if (existingDibursement.paymentId) {
                await prisma.payment.update({
                    where: { id: existingDibursement.paymentId },
                    data: {
                        createdAt: data.date,
                        amount: String(data.amount),
                        paymentMode: data.paymentMode,
                        infos: data.information,
                    }
                });
            } else {
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
            }

            await prisma.purchaseOrder.update({
                where: { id: purchaseOrderId },
                data: {
                    isPaid: hasCompletedPayment,
                    payee: currentPayee.add(newAmount.valueOf()),
                },
            });

            if (purchaseExist.supplierId) {
                const supplierAmountChange = existingDibursement.referencePurchaseOrderId === purchaseOrderId
                    ? amountDifference.toNumber()
                    : newAmount.toNumber();

                await prisma.supplier.update({
                    where: { id: purchaseExist.supplierId },
                    data: {
                        due: { decrement: supplierAmountChange },
                        paidAmount: { increment: supplierAmountChange }
                    }
                });
            }
        } else if (existingDibursement.referencePurchaseOrderId) {
            // Si on enlève la référence au bon de commande, restaurer l'ancien montant
            const oldPurchaseOrder = await prisma.purchaseOrder.findUnique({
                where: { id: existingDibursement.referencePurchaseOrderId },
                include: { supplier: true }
            });

            if (oldPurchaseOrder) {
                const oldAmount = new Decimal(existingDibursement.amount.toString());

                await prisma.purchaseOrder.update({
                    where: { id: existingDibursement.referencePurchaseOrderId },
                    data: {
                        payee: oldPurchaseOrder.payee.minus(oldAmount.toString()),
                        isPaid: false
                    }
                });

                if (oldPurchaseOrder.supplierId) {
                    await prisma.supplier.update({
                        where: { id: oldPurchaseOrder.supplierId },
                        data: {
                            due: { increment: oldAmount.toNumber() },
                            paidAmount: { decrement: oldAmount.toNumber() }
                        }
                    });
                }
            }

            // Supprimer le paiement associé
            if (existingDibursement.paymentId) {
                await prisma.payment.delete({
                    where: { id: existingDibursement.paymentId }
                });
                paymentId = null;
            }
        }

        if (paymentId) {
            Object.assign(referenceDocument, {
                payment: { connect: { id: paymentId } },
            });
        } else {
            Object.assign(referenceDocument, {
                payment: { disconnect: true },
            });
        }

        const updatedDibursement = await prisma.dibursement.update({
            where: { id: res.id },
            data: {
                date: data.date,
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
                message: `${user.name} a modifié un décaissement de ${formatNumber(data.amount)} ${companyExist.currency}, au titre de la catégorie « ${category.name} » (motif : ${nature?.name}), depuis le compte « ${source?.name} ».
                \nCommentaire : \n
                ${data.information}
                `,
                paymentDibursement: {
                    connect: { id: updatedDibursement.id }
                },
                company: {
                    connect: { id: updatedDibursement.companyId }
                }
            }
        });

        return NextResponse.json({
            status: "success",
            message: "Le décaissement a été mis à jour avec succès.",
            data: updatedDibursement,
        });
    } catch (error: any) {
        console.error("Error updating disbursement:", error);
        const isClientError = error instanceof Error && (
            /Identifiant|dépasse|déjà réglé|obligatoire/i.test(error.message)
        );

        const status = isClientError ? 400 : 500;
        const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour du décaissement.";

        return NextResponse.json(
            { status: "error", message },
            { status }
        );
    }
}