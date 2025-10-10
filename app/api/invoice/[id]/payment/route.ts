import { INVOICE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { paymentSchema, PaymentSchemaType } from "@/lib/zod/payment.schema";
import Decimal from "decimal.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["INVOICES"], "MODIFY");
    const id = getIdFromUrl(req.url, 2) as string;
    const res = await req.json();

    const data = parseData<PaymentSchemaType>(paymentSchema, {
        ...res,
        date: new Date(res.date),
    }) as PaymentSchemaType;

    try {
        const { payment, invoice } = await prisma.$transaction(async (tx) => {
            const invoiceExist = await tx.invoice.findUnique({
                where: { id },
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

            if (!invoiceExist) {
                throw new Error("Identifiant de facture invalide.");
            }

            if (invoiceExist.isPaid) {
                throw new Error("Cette facture est déjà réglée et ne peut pas recevoir de nouveau paiement.");
            }

            const total =
                invoiceExist.amountType === "HT"
                    ? invoiceExist.totalHT
                    : invoiceExist.totalTTC;

            const payee = invoiceExist.payee;
            const remaining = total.minus(payee);
            const newAmount = new Decimal(data.amount);

            if (!data.isPaid && newAmount.gt(remaining.valueOf())) {
                throw new Error(
                    `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining.toString()
                    )} ${invoiceExist.company.currency}).`
                );
            }

            const hasCompletedPayment =
                data.isPaid || payee.add(newAmount.valueOf()).gte(total.minus(0.01));

            const payment = await tx.payment.create({
                data: {
                    amount: String(data.isPaid ? remaining : data.amount),
                    paymentMode: data.mode,
                    infos: data.information,
                    invoice: { connect: { id } },
                },
            });

            const invoice = await tx.invoice.update({
                where: { id },
                data: {
                    isPaid: hasCompletedPayment,
                    payee: String(data.isPaid ? total : payee.add(newAmount.valueOf())),
                },
                include: {
                    company: {
                        include: {
                            documentModel: true
                        }
                    },
                    client: true,

                },
            });

            return { payment, invoice };
        });


        // Vérifier et récupérer ou créer la catégorie, nature et source
        let categoryId: string = '';
        let natureId: string = '';
        let sourceId: string = '';

        // Vérifier si la catégorie existe
        let category = await prisma.transactionCategory.findFirst({
            where: {
                name: "Règlement fournisseur",
                companyId: invoice.companyId
            }
        });

        // Si la catégorie n'existe pas, la créer
        if (!category) {
            category = await prisma.transactionCategory.create({
                data: {
                    company: {
                        connect: {
                            id: invoice.companyId
                        }
                    },
                    name: "Règlement fournisseur",
                },
            });
        }
        categoryId = category.id;

        // Vérifier si la nature existe
        let nature = await prisma.transactionNature.findFirst({
            where: {
                name: "Règlement facture fournisseur",
                companyId: invoice.companyId,
                categoryId: category.id
            }
        });

        // Si la nature n'existe pas, la créer
        if (!nature) {
            nature = await prisma.transactionNature.create({
                data: {
                    category: {
                        connect: {
                            id: category.id
                        }
                    },
                    company: {
                        connect: {
                            id: invoice.companyId
                        }
                    },
                    name: "Règlement facture fournisseur",
                },
            });
        }
        natureId = nature.id;

        // Vérifier si la source existe
        let source = await prisma.source.findFirst({
            where: {
                name: "BGFIBank",
                companyId: invoice.companyId
            }
        });

        // Si la source n'existe pas, la créer
        if (!source) {
            source = await prisma.source.create({
                data: {
                    company: {
                        connect: {
                            id: invoice.companyId
                        }
                    },
                    name: "BGFIBank",
                },
            });
        }
        sourceId = source.id;


        await prisma.receipt.create({
            data: {
                date: payment.createdAt,
                amount: new Decimal(data.amount),
                amountType: "HT",
                description: `Paiement facture ${invoice.company.documentModel?.invoicesPrefix || INVOICE_PREFIX} ${generateAmaId(invoice.invoiceNumber, false)} ${new Date().getFullYear()}`,
                checkNumber: '2345678',
                paymentType: 'check',
                client: {
                    connect: {
                        id: invoice.clientId as string
                    }
                },
                referenceInvoice: {
                    connect: {
                        id: invoice.id
                    }
                },
                category: {
                    connect: {
                        id: categoryId
                    }
                },
                nature: {
                    connect: {
                        id: natureId
                    }
                },
                source: {
                    connect: {
                        id: sourceId
                    }
                },
                company: {
                    connect: {
                        id: invoice.companyId
                    }
                }
            }
        });

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
