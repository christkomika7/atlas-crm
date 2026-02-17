import { RECEIPT_CATEGORY } from "@/config/constant";
import { checkAccess, sessionAccess } from "@/lib/access"
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { receiptSchema, ReceiptSchemaType } from "@/lib/zod/receipt.schema";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["MODIFY"]);
    const { userId } = await sessionAccess();

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

    // Validation de l'ID de l'encaissement
    if (!res.id) {
        return NextResponse.json({
            state: "error",
            message: "L'identifiant de l'encaissement est requis."
        }, { status: 400 });
    }

    const data = parseData<ReceiptSchemaType>(receiptSchema, {
        ...res,
        date: new Date(res.date)
    }) as ReceiptSchemaType;

    // Vérifier si l'encaissement existe
    const existingReceipt = await prisma.receipt.findUnique({
        where: { id: res.id },
        include: {
            payment: true,
            referenceInvoice: true,
            client: true
        }
    });

    if (!existingReceipt) {
        return NextResponse.json({
            state: "error",
            message: "Encaissement non trouvé."
        }, { status: 404 });
    }

    const companyExist = await prisma.company.findUnique({ where: { id: data.companyId } });

    if (!companyExist) return NextResponse.json({
        status: "error",
        message: "Identifiant invalide",
    }, { status: 404 });

    try {
        const category = await prisma.transactionCategory.findUnique({ where: { id: data.category } });

        if (!category) {
            return NextResponse.json({
                status: "error",
                message: "Catégorie invalide.",
            }, { status: 404 });
        }

        if (RECEIPT_CATEGORY.includes(category.name) && !data.documentRef) {
            return NextResponse.json({
                status: "error",
                message: "Aucune référence de document trouvée.",
            }, { status: 404 });
        }

        const referenceDocument: Record<string, any> = {};

        if (data.documentRef) {
            Object.assign(referenceDocument, {
                referenceInvoice: {
                    connect: {
                        id: data.documentRef
                    }
                },
            });
        } else {
            Object.assign(referenceDocument, {
                referenceInvoice: {
                    disconnect: true
                },
            });
        }

        if (data.project) {
            Object.assign(referenceDocument, {
                project: {
                    connect: {
                        id: data.project
                    }
                }
            })
        } else {
            Object.assign(referenceDocument, {
                project: {
                    disconnect: true
                }
            })
        }

        let paymentId = existingReceipt.paymentId;
        let clientId = "";

        if (data.documentRef) {
            const invoiceExist = await prisma.invoice.findUnique({
                where: { id: data.documentRef },
                include: {
                    company: true,
                    project: true,
                    client: true
                }
            });

            clientId = invoiceExist?.clientId || "";

            if (!invoiceExist) {
                return NextResponse.json({
                    status: "error",
                    message: "Identifiant de facture invalide.",
                }, { status: 400 });
            }

            const total =
                invoiceExist.amountType === "HT"
                    ? invoiceExist.totalHT
                    : invoiceExist.totalTTC;

            const oldAmount = new Decimal(existingReceipt.amount.toString());
            const newAmount = new Decimal(data.amount);
            const amountDifference = newAmount.minus(oldAmount);

            // Restaurer l'ancien montant si on change de facture
            if (existingReceipt.referenceInvoiceId && existingReceipt.referenceInvoiceId !== data.documentRef) {
                const oldInvoice = await prisma.invoice.findUnique({
                    where: { id: existingReceipt.referenceInvoiceId },
                    include: { client: true, project: true }
                });

                if (oldInvoice) {
                    await prisma.invoice.update({
                        where: { id: existingReceipt.referenceInvoiceId },
                        data: {
                            payee: oldInvoice.payee.minus(oldAmount.toString()),
                            isPaid: false
                        }
                    });

                    if (oldInvoice.clientId) {
                        await prisma.client.update({
                            where: { id: oldInvoice.clientId },
                            data: {
                                due: { increment: oldAmount.toNumber() },
                                paidAmount: { decrement: oldAmount.toNumber() }
                            }
                        });
                    }

                    if (oldInvoice.projectId) {
                        await prisma.project.update({
                            where: { id: oldInvoice.projectId },
                            data: {
                                balance: { decrement: oldAmount.toNumber() }
                            }
                        });
                    }
                }
            }

            const currentPayee = existingReceipt.referenceInvoiceId === data.documentRef
                ? invoiceExist.payee.minus(oldAmount.toString())
                : invoiceExist.payee;

            const remaining = total.minus(currentPayee);

            if (newAmount.gt(remaining.valueOf())) {
                return NextResponse.json({
                    status: "error",
                    message: `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining.toString()
                    )} ${invoiceExist.company.currency}).`,
                }, { status: 400 });
            }

            const hasCompletedPayment = currentPayee.add(newAmount.valueOf()).gte(total.minus(0.01));

            // Mettre à jour ou créer le paiement
            if (existingReceipt.paymentId) {
                await prisma.payment.update({
                    where: { id: existingReceipt.paymentId },
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
                        invoice: { connect: { id: data.documentRef } },
                    },
                });
                paymentId = newPayment.id;
            }

            await prisma.invoice.update({
                where: { id: data.documentRef },
                data: {
                    isPaid: hasCompletedPayment,
                    payee: currentPayee.add(newAmount.valueOf()),
                }
            });

            if (invoiceExist.clientId) {
                const clientAmountChange = existingReceipt.referenceInvoiceId === data.documentRef
                    ? amountDifference.toNumber()
                    : newAmount.toNumber();

                await prisma.client.update({
                    where: { id: invoiceExist.clientId },
                    data: {
                        due: { decrement: clientAmountChange },
                        paidAmount: { increment: clientAmountChange }
                    }
                });
            }

            if (invoiceExist.projectId) {
                const projectAmountChange = existingReceipt.referenceInvoiceId === data.documentRef
                    ? amountDifference.toNumber()
                    : newAmount.toNumber();

                await prisma.project.update({
                    where: { id: invoiceExist.projectId },
                    data: {
                        balance: { increment: projectAmountChange }
                    }
                });
            }
        } else if (existingReceipt.referenceInvoiceId) {
            // Si on enlève la référence à la facture, restaurer l'ancien montant
            const oldInvoice = await prisma.invoice.findUnique({
                where: { id: existingReceipt.referenceInvoiceId },
                include: { client: true, project: true }
            });

            if (oldInvoice) {
                const oldAmount = new Decimal(existingReceipt.amount.toString());

                await prisma.invoice.update({
                    where: { id: existingReceipt.referenceInvoiceId },
                    data: {
                        payee: oldInvoice.payee.minus(oldAmount.toString()),
                        isPaid: false
                    }
                });

                if (oldInvoice.clientId) {
                    await prisma.client.update({
                        where: { id: oldInvoice.clientId },
                        data: {
                            due: { increment: oldAmount.toNumber() },
                            paidAmount: { decrement: oldAmount.toNumber() }
                        }
                    });
                }

                if (oldInvoice.projectId) {
                    await prisma.project.update({
                        where: { id: oldInvoice.projectId },
                        data: {
                            balance: { decrement: oldAmount.toNumber() }
                        }
                    });
                }
            }

            // Supprimer le paiement associé
            if (existingReceipt.paymentId) {
                await prisma.payment.delete({
                    where: { id: existingReceipt.paymentId }
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

        if (clientId) {
            Object.assign(referenceDocument, {
                client: {
                    connect: {
                        id: clientId
                    }
                },
            });
        } else {
            Object.assign(referenceDocument, {
                client: {
                    disconnect: true
                },
            });
        }

        const updatedReceipt = await prisma.receipt.update({
            where: { id: res.id },
            data: {
                date: data.date,
                amount: String(data.amount),
                amountType: data.amountType,
                paymentType: data.paymentMode,
                checkNumber: data.checkNumber || "",
                infos: data.information,
                userAction: {
                    connect: {
                        id: data.userAction as string
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
                source: {
                    connect: {
                        id: data.source
                    }
                },
                company: {
                    connect: {
                        id: data.companyId
                    }
                },
                ...referenceDocument,
            },
            include: {
                company: true,
                source: true
            }
        });

        await prisma.notification.create({
            data: {
                type: 'ALERT',
                for: 'RECEIPT',
                message: `${user.name} a modifié un encaissement de ${formatNumber(data.amount)} ${updatedReceipt.company.currency} dans le compte ${updatedReceipt.source?.name}.
                \nCommentaire : \n
                ${data.information}
                `,
                receipt: {
                    connect: { id: updatedReceipt.id }
                },
                company: {
                    connect: { id: updatedReceipt.companyId }
                }
            }
        });

        return NextResponse.json({
            status: "success",
            message: "L'encaissement a été mis à jour avec succès.",
            data: updatedReceipt,
        });

    } catch (error) {
        console.error("Error updating receipt:", error);
        const isClientError = error instanceof Error && (
            /Identifiant|dépasse|déjà réglé|invalide/i.test(error.message)
        );

        const status = isClientError ? 400 : 500;
        const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'encaissement.";

        return NextResponse.json(
            { status: "error", message },
            { status }
        );
    }
}