import { checkAccess } from "@/lib/access";
import { toUtcDateOnly } from "@/lib/date";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber, getIdFromUrl } from "@/lib/utils";
import { purchaseOrderPaymentSchema, PurchaseOrderPaymentSchemaType } from "@/lib/zod/payment.schema";
import Decimal from "decimal.js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["PURCHASE_ORDER"], "MODIFY");
    const id = getIdFromUrl(req.url, 2) as string;
    const res = await req.json();

    const data = parseData<PurchaseOrderPaymentSchemaType>(purchaseOrderPaymentSchema, {
        ...res,
        date: toUtcDateOnly(res.date),
    }) as PurchaseOrderPaymentSchemaType;

    try {
        const { purchaseOrder } = await prisma.$transaction(async (tx) => {
            const purchaseExist = await tx.purchaseOrder.findUnique({
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

            if (!data.isPaid && newAmount.gt(remaining.valueOf())) {
                throw new Error(
                    `Le montant saisi dépasse le solde restant à payer (${formatNumber(
                        remaining.toString()
                    )} ${purchaseExist.company.currency}).`
                );
            }

            const hasCompletedPayment =
                data.isPaid || payee.add(newAmount.valueOf()).gte(total.minus(0.01));

            await tx.payment.create({
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
                            documentModel: true
                        }
                    },
                    supplier: true,
                },
            });

            return { purchaseOrder };
        });

        // Vérifier et récupérer ou créer la catégorie, nature et source
        const natureName = purchaseOrder.supplier!.companyName;
        let categoryId: string = '';
        let natureId: string = '';

        // Vérifier si la catégorie existe
        let category = await prisma.transactionCategory.findFirst({
            where: {
                name: "Règlement fournisseur",
                companyId: purchaseOrder.companyId
            }
        });

        // Si la catégorie n'existe pas, la créer
        if (!category) {
            category = await prisma.transactionCategory.create({
                data: {
                    company: {
                        connect: {
                            id: purchaseOrder.companyId
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
                name: natureName,
                companyId: purchaseOrder.companyId,
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
                            id: purchaseOrder.companyId
                        }
                    },
                    name: natureName,
                },
            });
        }
        natureId = nature.id;


        // Créer le disbursement avec les IDs récupérés ou créés
        await prisma.dibursement.create({
            data: {
                date: toUtcDateOnly(data.date),
                amount: new Decimal(data.amount),
                amountType: purchaseOrder.amountType,
                checkNumber: data.checkNumber || "",
                paymentType: data.mode,
                description: data.information || "",
                supplier: {
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
                        id: categoryId
                    }
                },
                nature: {
                    connect: {
                        id: natureId
                    }
                },
                allocation: {
                    connect: {
                        id: data.allocation
                    }
                },
                source: {
                    connect: {
                        id: data.source
                    }
                },
                // payOnBehalfOf: {

                // },
                company: {
                    connect: {
                        id: purchaseOrder.companyId
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