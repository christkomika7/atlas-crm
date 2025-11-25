import { DIBURSMENT_CATEGORY, FISCAL_NATURE } from "@/config/constant";
import { checkAccess } from "@/lib/access"
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { dibursementSchema, DibursementSchemaType } from "@/lib/zod/dibursement.schema";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE"]);

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }
    const res = await req.json();

    const data = parseData<DibursementSchemaType>(dibursementSchema, {
        ...res,
        date: new Date(res.date),
        period: res.period
            ? {
                from: new Date(res.period.from),
                to: new Date(res.period.to),
            }
            : undefined,
    }) as DibursementSchemaType;

    const companyExist = await prisma.company.findUnique({ where: { id: data.companyId } });

    if (!companyExist) {
        return NextResponse.json(
            { status: "error", message: "Identifiant invalide" },
            { status: 404 }
        );
    }

    const [category, nature] = await prisma.$transaction([
        prisma.transactionCategory.findUnique({ where: { id: data.category } }),
        prisma.transactionNature.findUnique({ where: { id: data.nature } }),
    ]);

    if (!category) {
        return NextResponse.json(
            { status: "error", message: "Catégorie invalide" },
            { status: 404 }
        );
    }

    if (DIBURSMENT_CATEGORY.includes(category.name) && !data.allocation) {
        return NextResponse.json(
            { status: "error", message: "L'allocation est obligatoire pour le règlement fournisseur" },
            { status: 400 }
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

    if (data.allocation) {
        Object.assign(referenceDocument, {
            allocation: { connect: { id: data.allocation } },
        });
    }

    if (data.period) {
        Object.assign(referenceDocument, {
            periodStart: data.period.from,
            periodEnd: data.period.to,
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

    if (data.payOnBehalfOf) {
        Object.assign(referenceDocument, {
            payOnBehalfOf: { connect: { id: data.payOnBehalfOf } },
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

            const newPayment = await prisma.payment.create({
                data: {
                    createdAt: data.date,
                    amount: String(data.amount),
                    paymentMode: data.paymentMode,
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
                paymentType: data.paymentMode,
                checkNumber: data.checkNumber,
                description: data.description,
                comment: data.comment,
                category: { connect: { id: data.category } },
                source: { connect: { id: data.source } },
                nature: { connect: { id: data.nature } },
                company: { connect: { id: data.companyId } },
                ...referenceDocument,
            },
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
