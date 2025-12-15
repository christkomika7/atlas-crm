import { checkAccess, sessionAccess } from "@/lib/access";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { toUtcDateOnly } from "@/lib/date";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";

export async function PUT(req: NextRequest) {
    const result = await checkAccess(['TRANSACTION', 'PURCHASE_ORDER'], "MODIFY");
    const { userId } = await sessionAccess();

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
        }, { status: 200 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId as string } })

    if (!user) return NextResponse.json({
        state: "error",
        message: "Utlisateur non trouvé."
    }, { status: 400 });

    try {
        const { notificationId, action } = await req.json();

        if (!notificationId || !action) {
            return NextResponse.json({
                status: "error",
                message: "Paramètres manquants.",
            }, { status: 400 });
        }

        if (action !== 'validate' && action !== 'cancel') {
            return NextResponse.json({
                status: "error",
                message: "Action invalide. Utilisez 'validate' ou 'cancel'.",
            }, { status: 400 });
        }

        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
            include: {
                dibursement: true,
                company: true
            }
        });

        if (!notification) {
            return NextResponse.json({
                status: "error",
                message: "Notification introuvable.",
            }, { status: 404 });
        }

        if (!notification.active) {
            return NextResponse.json({
                status: "error",
                message: "Cette action a déjà été traitée.",
            }, { status: 400 });
        }

        if (notification.type !== "CONFIRM") {
            return NextResponse.json({
                status: "error",
                message: "Cette notification ne nécessite pas de confirmation.",
            }, { status: 400 });
        }

        // Si l'action est 'cancel'
        if (action === 'cancel') {
            const source = await prisma.source.findUnique({ where: { id: notification.dibursement?.source as string } })

            await prisma.$transaction([
                prisma.dibursementData.deleteMany({
                    where: { id: notification.dibursement?.id }
                }),
                prisma.notification.update({
                    where: { id: notification.id },
                    data: { active: false }
                }),
                prisma.notificationRead.upsert({
                    where: {
                        notificationId_userId: {
                            notificationId: notification.id,
                            userId: user.id as string
                        }
                    },
                    create: {
                        notificationId: notification.id,
                        userId: user.id as string
                    },
                    update: {
                        readAt: new Date()
                    }
                }),

                prisma.notification.create({
                    data: {
                        type: 'ALERT',
                        for: 'DISBURSEMENT',
                        message: `${user.name} a annulé un décaissement de ${formatNumber(notification.dibursement?.amount.toString() || 0)} ${notification.company.currency} dans le compte ${source?.name}.`,
                        company: {
                            connect: { id: notification.companyId }
                        }
                    }
                })
            ]);

            return NextResponse.json({
                status: "success",
                message: "Le décaissement a été annulé avec succès.",
            }, { status: 200 });
        }

        switch (notification.for) {
            case "DISBURSEMENT":
                if (notification.dibursement) {
                    const data = notification.dibursement;

                    const referenceDocument: Record<string, any> = {};


                    if (data.fiscalObject) {
                        Object.assign(referenceDocument, {
                            fiscalObject: { connect: { id: data.fiscalObject } },
                        });
                    }

                    if (data.allocation) {
                        Object.assign(referenceDocument, {
                            allocation: { connect: { id: data.allocation } },
                        });
                    }

                    if (data.periodStart && data.periodEnd) {
                        Object.assign(referenceDocument, {
                            periodStart: data.periodStart,
                            periodEnd: data.periodEnd,
                        });
                    }

                    if (data.purchaseOrder) {
                        Object.assign(referenceDocument, {
                            referencePurchaseOrder: { connect: { id: data.purchaseOrder } },
                        });
                    }

                    const partners = data.supplier ? JSON.parse(data.supplier) as string[] : [];

                    if (partners.length > 0) {
                        Object.assign(referenceDocument, {
                            suppliers: {
                                connect: [
                                    ...(partners.map(partner => ({ id: partner })) || [])
                                ]
                            },
                        });
                    }

                    if (data.project) {
                        Object.assign(referenceDocument, {
                            project: { connect: { id: data.project } },
                        });
                    }

                    if (data.payOnBehalfOf) {
                        Object.assign(referenceDocument, {
                            payOnBehalfOf: { connect: { id: data.payOnBehalfOf } },
                        });
                    }

                    try {

                        let paymentId = "";
                        const source = await prisma.source.findUnique({ where: { id: notification.dibursement?.source as string } })

                        if (data.purchaseOrder) {
                            const purchaseOrderId = data.purchaseOrder;

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
                            const newAmount = new Decimal(data.amount.toString());

                            if (newAmount.gt(remaining.valueOf())) {
                                return NextResponse.json({
                                    status: "error",
                                    message: `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                                        remaining.toString()
                                    )} ${purchaseExist.company.currency}).`,
                                }, { status: 400 });
                            }

                            const hasCompletedPayment = payee.add(newAmount.valueOf()).gte(total.minus(0.01));

                            const newPayment = await prisma.payment.create({
                                data: {
                                    createdAt: data.date,
                                    amount: String(data.amount),
                                    paymentMode: data.paymentType,
                                    infos: data.description,
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
                                amountType: data.amountType,
                                paymentType: data.paymentType,
                                checkNumber: data.checkNumber,
                                description: data.description,
                                comment: data.comment,
                                category: { connect: { id: data.category } },
                                source: { connect: { id: data.source as string } },
                                nature: { connect: { id: data.nature } },
                                company: { connect: { id: notification.companyId } },
                                ...referenceDocument,
                            },
                        });

                        await prisma.notification.create({
                            data: {
                                type: 'ALERT',
                                for: 'DISBURSEMENT',
                                message: `${user.name} a validé un décaissement de ${formatNumber(data.amount.toString())} ${notification.company.currency} dans le compte ${source?.name}.`,
                                paymentDibursement: {
                                    connect: { id: createdDibursement.id }
                                },
                                company: {
                                    connect: { id: createdDibursement.companyId }
                                }
                            }
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
                break;
            case 'PURCHASE_ORDER':
                if (notification.type === "CONFIRM") {
                    const { purchaseOrder, payment } = await prisma.$transaction(async (tx) => {
                        const purchaseExist = await tx.purchaseOrder.findUnique({
                            where: { id: notification.purchaseOrderId as string },
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

                        const data = notification.dibursement!;

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
                        const newAmount = new Decimal(data?.amount?.toString() || 0);

                        if (!data?.isPaid && newAmount.gt(remaining.valueOf())) {
                            throw new Error(
                                `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                                    remaining.toString()
                                )} ${purchaseExist.company.currency}).`
                            );
                        }

                        const hasCompletedPayment =
                            data?.isPaid || payee.add(newAmount.valueOf()).gte(total.minus(0.01));

                        const payment = await tx.payment.create({
                            data: {
                                createdAt: data?.date,
                                amount: String(data?.isPaid ? remaining : data?.amount),
                                paymentMode: data?.paymentType as string,
                                infos: data?.description,
                                purchaseOrder: { connect: { id: purchaseExist.id } },
                            },
                        });

                        const purchaseOrder = await tx.purchaseOrder.update({
                            where: { id: purchaseExist.id },
                            data: {
                                isPaid: hasCompletedPayment,
                                payee: String(data?.isPaid ? total : payee.add(newAmount.valueOf())),
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
                                date: toUtcDateOnly(notification.dibursement!.date),
                                amount: new Decimal(notification.dibursement!.amount.toString()),
                                amountType: purchaseOrder.amountType,
                                checkNumber: notification.dibursement!.checkNumber || "",
                                paymentType: notification.dibursement!.paymentType,
                                description: notification.dibursement!.description || "",
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
                                        id: notification.dibursement!.category
                                    }
                                },
                                nature: {
                                    connect: {
                                        id: notification.dibursement!.nature
                                    }
                                },
                                allocation: {
                                    connect: {
                                        id: notification.dibursement!.allocation as string
                                    }
                                },
                                source: {
                                    connect: {
                                        id: notification.dibursement!.source as string
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
                                    decrement: notification.dibursement!.amount
                                },
                                paidAmount: {
                                    increment: notification.dibursement!.amount
                                }
                            }
                        })
                    ]);
                }
            case "TRANSFER":
                if (notification.type === "CONFIRM") {
                    const data = notification.dibursement!;
                    const [origin, destination] = JSON.parse(data.source as string) as [string, string];
                    const [disbursementNature, receiptNature] = JSON.parse(data.nature) as [string, string];

                    const [sourceA, sourceB] = await prisma.$transaction([
                        prisma.source.findUnique({ where: { id: origin } }),
                        prisma.source.findUnique({ where: { id: destination } }),
                    ]);

                    await prisma.dibursement.create({
                        data: {
                            type: "DISBURSEMENT",
                            date: data.date,
                            movement: 'OUTFLOWS',
                            amount: data.amount,
                            amountType: "HT",
                            paymentType: "withdrawal",
                            description: data.description || `Transfert vers ${sourceB?.name}`,
                            comment: data.comment,
                            category: {
                                connect: { id: data.category }
                            },
                            nature: {
                                connect: { id: disbursementNature }
                            },
                            source: {
                                connect: { id: origin }
                            },
                            company: {
                                connect: { id: notification.companyId }
                            }
                        }
                    });

                    await prisma.receipt.create({
                        data: {
                            type: "RECEIPT",
                            date: data.date,
                            movement: 'INFLOWS',
                            amount: data.amount,
                            amountType: "HT",
                            paymentType: "withdrawal",
                            description: data.description || `Transfert depuis ${sourceA?.name}`,
                            comment: data.comment,
                            category: {
                                connect: { id: data.category }
                            },
                            nature: {
                                connect: { id: receiptNature }
                            },
                            source: {
                                connect: { id: destination }
                            },
                            company: {
                                connect: { id: notification.companyId }
                            }
                        }
                    });

                    await prisma.notification.create({
                        data: {
                            type: 'ALERT',
                            for: 'TRANSFER',
                            message: `${user.name} a réalisé un transfert  de ${formatNumber(data.amount.toString())} ${notification.company.currency} du compte ${sourceA?.name} vers le compte ${sourceB?.name}.`,
                            company: {
                                connect: { id: notification.companyId }
                            }
                        }
                    });

                }
                break
            default:
                return NextResponse.json({
                    status: "error",
                    message: "Type de notification non géré.",
                }, { status: 400 });
        }


        // Marquer comme lu automatiquement
        await prisma.notificationRead.upsert({
            where: {
                notificationId_userId: {
                    notificationId: notificationId,
                    userId: user.id
                }
            },
            create: {
                notificationId: notificationId,
                userId: user.id
            },
            update: {
                readAt: new Date()
            }
        });

        return NextResponse.json({
            status: "success",
            message: "L'action a été validée avec succès.",
        }, { status: 200 });

    } catch (error: any) {
        console.error("Erreur lors de la confirmation de l'action:", error);
        return NextResponse.json(
            {
                status: "error",
                message: error.message || "Erreur lors du traitement de l'action."
            },
            { status: 500 }
        );
    }
} 