import { DIBURSMENT_CATEGORY } from "@/config/constant";
import { checkAccess } from "@/lib/access"
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { dibursementSchema, DibursementSchemaType } from "@/lib/zod/dibursement.schema";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    checkAccess(["TRANSACTION"], "CREATE");

    const res = await req.json();

    const data = parseData<DibursementSchemaType>(dibursementSchema, {
        ...res,
        date: new Date(res.date),
        period: res.period ? {
            from: new Date(res.period.from),
            to: new Date(res.period.to),
        } : undefined
    }) as DibursementSchemaType;

    const companyExist = await prisma.company.findUnique({ where: { id: data.companyId } });

    if (!companyExist) return NextResponse.json({
        status: "error",
        message: "Identifiant invalide",
    }, { status: 404 })

    const category = await prisma.transactionCategory.findUnique({ where: { id: data.category } });

    if (!category) {
        return NextResponse.json({
            status: "error",
            message: "Catégorie invalide",
        }, { status: 404 })
    }

    if (DIBURSMENT_CATEGORY.includes(category.name) && !data.allocation) {
        return NextResponse.json({
            status: "error",
            message: "L'allocation est obligatoire pour le règlement fournisseur",
        }, { status: 404 })
    }

    try {

        const referenceDocument = {};

        if (data.allocation) {
            Object.assign(referenceDocument, {
                allocation: {
                    connect: {
                        id: data.allocation
                    }
                },
            })
        }

        if (data.period) {
            Object.assign(referenceDocument, {
                periodStart: data.period.from,
                periodEnd: data.period.to
            })
        }

        if (data.documentRef) {
            Object.assign(referenceDocument, {
                referencePurchaseOrder: {
                    connect: {
                        id: data.documentRef
                    }
                },
            })
        }

        if (data.project) {
            Object.assign(referenceDocument, {
                project: {
                    connect: {
                        id: data.project
                    }
                }
            });
        }

        if (data.payOnBehalfOf) {
            Object.assign(referenceDocument, {
                payOnBehalfOf: {
                    connect: {
                        id: data.payOnBehalfOf
                    }
                },
            });
        }

        const createdDibursement = await prisma.dibursement.create({
            data: {
                type: "DISBURSEMENT",
                date: data.date,
                movement: 'OUTFLOWS',
                amount: String(data.amount),
                amountType: data.amountType,
                paymentType: data.paymentMode,
                checkNumber: data.checkNumber,
                description: data.description,
                comment: data.comment,
                category: {
                    connect: {
                        id: data.category
                    }
                },
                source: {
                    connect: {
                        id: data.source
                    }
                },
                nature: {
                    connect: {
                        id: data.nature
                    }
                },
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                ...referenceDocument,
            }
        });

        if (data.documentRef) {
            const purchaseOrderId = data.documentRef;
            await prisma.$transaction(async (tx) => {
                const purchaseExist = await tx.purchaseOrder.findUnique({
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
                    throw new Error("Identifiant de facture invalide.");
                }

                if (purchaseExist.isPaid) {
                    throw new Error("Ce bon de commande est déjà réglé et ne peut pas recevoir de nouveau paiement.");
                }

                const total =
                    purchaseExist.amountType === "HT"
                        ? purchaseExist.totalHT
                        : purchaseExist.totalTTC;

                const payee = purchaseExist.payee;
                const remaining = total.minus(payee);
                const newAmount = new Decimal(data.amount);

                if (newAmount.gt(remaining.valueOf())) {
                    throw new Error(
                        `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                            remaining.toString()
                        )} ${purchaseExist.company.currency}).`
                    );
                }

                const hasCompletedPayment =
                    payee.add(newAmount.valueOf()).gte(total.minus(0.01));

                await tx.payment.create({
                    data: {
                        createdAt: data.date,
                        amount: String(data.amount),
                        paymentMode: data.paymentMode,
                        infos: data.description,
                        purchaseOrder: { connect: { id: purchaseOrderId } },
                    },
                });

                await tx.purchaseOrder.update({
                    where: { id: purchaseOrderId },
                    data: {
                        isPaid: hasCompletedPayment,
                        payee: payee.add(newAmount.valueOf()),
                    },
                    include: {
                        company: {
                            include: {
                                documentModel: true
                            }
                        },
                        supplier: true,
                    },
                });
            });

        }

        return NextResponse.json({
            status: "success",
            message: "Le décaissement crée avec succès.",
            data: createdDibursement,
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création de décaissement.",
        }, { status: 500 });
    }

}