import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { checkAccess, sessionAccess } from "@/lib/access";
import { toUtcDateOnly } from "@/lib/date";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { purchaseOrderPaymentSchema, PurchaseOrderPaymentSchemaType } from "@/lib/zod/payment.schema";
import Decimal from "decimal.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("PURCHASE_ORDER", "MODIFY");
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

    const id = getIdFromUrl(req.url, 2) as string;
    const res = await req.json();

    const data = parseData<PurchaseOrderPaymentSchemaType>(purchaseOrderPaymentSchema, {
        ...res,
        date: toUtcDateOnly(res.date),
    }) as PurchaseOrderPaymentSchemaType;

    try {
        const purchaseExist = await prisma.purchaseOrder.findUnique({
            where: { id },
            select: {
                id: true,
                amountType: true,
                payee: true,
                totalTTC: true,
                totalHT: true,
                isPaid: true,
                supplierId: true,
                projectId: true,
                companyId: true,
                company: {
                    select: {
                        id: true,
                        currency: true,
                        profiles: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
            },
        });

        if (!purchaseExist) {
            throw new Error("Identifiant de bon de commande invalide.");
        }

        let categorie = await prisma.transactionCategory.findFirst({
            where: {
                id: data.category,
            }
        });


        if (!categorie) {
            throw new Error("Catégorie de transaction non trouvée.");
        }



        let nature = await prisma.transactionNature.findFirst({
            where: {
                id: data.nature,
            }
        });

        if (!nature) {
            throw new Error("Nature de transaction non trouvée.");
        }
        if (!isAdmin) {

            const source = await prisma.source.findUnique({ where: { id: data.source } });

            if (!purchaseExist.projectId) {
                throw new Error("Le bon de commande doit être lié à un projet pour pouvoir enregistrer un paiement.");
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

            if (!data.isPaid && newAmount.gt(remaining.valueOf())) {
                throw new Error(
                    `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining.toString()
                    )} ${purchaseExist.company.currency}).`
                );
            }

            // Créer la demande en attente de validation
            const newDibursement = await prisma.dibursementData.create({
                data: {
                    date: data.date,
                    category: data.category,
                    nature: data.nature,
                    amount: data.amount,
                    amountType: purchaseExist.amountType,
                    paymentType: data.mode,
                    checkNumber: data.checkNumber,
                    purchaseOrder: purchaseExist.id,
                    source: data.source,
                    infos: data.information,
                    userAction: {
                        create: {
                            supplier: {
                                connect: {
                                    id: purchaseExist.supplierId as string
                                }
                            },
                            type: "SUPPLIER",
                            nature: {
                                connect: {
                                    id: nature.id
                                }
                            },
                            company: {
                                connect: {
                                    id: purchaseExist.companyId
                                }
                            }
                        }
                    }
                }
            });

            await prisma.notification.create({
                data: {
                    type: 'CONFIRM',
                    for: 'PURCHASE_ORDER',
                    message: `${user.name} a lancé une validation pour un paiement de ${formatNumber(data.amount)} ${purchaseExist.company.currency} depuis le compte ${source?.name}.`,
                    dibursement: {
                        connect: { id: newDibursement.id }
                    },
                    purchaseOrder: {
                        connect: { id: purchaseExist.id }
                    },
                    company: {
                        connect: { id: purchaseExist.companyId }
                    }
                }
            });

            return NextResponse.json({
                status: "success",
                message: "Votre requête est en attente de validation.",
            }, { status: 200 });
        }

        const { purchaseOrder, payment } = await prisma.$transaction(async (tx) => {
            const purchaseExist = await tx.purchaseOrder.findUnique({
                where: { id },
                select: {
                    id: true,
                    amountType: true,
                    payee: true,
                    totalTTC: true,
                    totalHT: true,
                    isPaid: true,
                    supplierId: true,
                    companyId: true,
                    company: {
                        select: {
                            id: true,
                            currency: true,
                            profiles: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                },
            });

            if (!purchaseExist) {
                throw new Error("Identifiant de bon de commande invalide.");
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

            if (!data.isPaid && newAmount.gt(remaining.valueOf())) {
                throw new Error(
                    `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining.toString()
                    )} ${purchaseExist.company.currency}).`
                );
            }

            const hasCompletedPayment =
                data.isPaid || payee.add(newAmount.valueOf()).gte(total.minus(0.01));

            const payment = await tx.payment.create({
                data: {
                    createdAt: data.date,
                    amount: String(data.isPaid ? remaining : data.amount),
                    paymentMode: data.mode,
                    infos: data.information,
                    purchaseOrder: { connect: { id } },
                },
            });

            const purchaseOrder = await tx.purchaseOrder.update({
                where: { id },
                data: {
                    isPaid: hasCompletedPayment,
                    payee: String(data.isPaid ? total : payee.add(newAmount.valueOf())),
                },
                include: {
                    company: {
                        include: {
                            documentModel: true,
                            profiles: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                    supplier: true,
                },
            });

            await tx.notification.create({
                data: {
                    type: 'ALERT',
                    for: 'PURCHASE_ORDER',
                    message: hasCompletedPayment
                        ? `${user.name} a réglé le bon de commande n° ${purchaseOrder.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(purchaseOrder.purchaseOrderNumber, false)}.`
                        : `${user.name} a réalisé un accompte de ${formatNumber(data.amount.toString())} ${purchaseOrder.company.currency} pour le bon de commande n° ${purchaseOrder.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(purchaseOrder.purchaseOrderNumber, false)}.`,
                    purchaseOrder: {
                        connect: { id: purchaseOrder.id }
                    },
                    company: {
                        connect: { id: purchaseOrder.companyId }
                    }
                }
            });

            return { purchaseOrder, payment };
        });

        await prisma.$transaction([
            prisma.dibursement.create({
                data: {
                    date: toUtcDateOnly(data.date),
                    amount: new Decimal(data.amount),
                    amountType: purchaseOrder.amountType,
                    checkNumber: data.checkNumber || "",
                    paymentType: data.mode,
                    infos: data.information || "",
                    suppliers: {
                        connect: {
                            id: purchaseOrder.supplierId as string
                        }
                    },
                    referencePurchaseOrder: {
                        connect: {
                            id: purchaseOrder.id
                        }
                    },
                    category: {
                        connect: {
                            id: data.category
                        }
                    },
                    nature: {
                        connect: {
                            id: data.nature
                        }
                    },
                    userAction: {
                        create: {
                            type: "SUPPLIER",
                            supplier: {
                                connect: {
                                    id: purchaseOrder.supplierId as string
                                }
                            },
                            nature: {
                                connect: {
                                    id: nature.id
                                }
                            },
                            company: {
                                connect: {
                                    id: purchaseOrder.companyId
                                }
                            }
                        }
                    },
                    source: {
                        connect: {
                            id: data.source
                        }
                    },
                    payment: {
                        connect: {
                            id: payment.id
                        }
                    },
                    company: {
                        connect: {
                            id: purchaseOrder.companyId
                        }
                    }
                }
            }),
            prisma.supplier.update({
                where: { id: purchaseOrder.supplierId as string },
                data: {
                    due: {
                        decrement: data.amount
                    },
                    paidAmount: {
                        increment: data.amount
                    }
                }
            })
        ]);

        return NextResponse.json(
            { state: "success", message: "Le paiement a été effectué avec succès." },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Erreur paiement:", error);
        return NextResponse.json(
            { state: "error", message: error.message || "Erreur lors de la création du paiement." },
            { status: 500 }
        );
    }
}