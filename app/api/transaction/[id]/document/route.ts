import { INVOICE_PREFIX, PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access"
import prisma from "@/lib/prisma";
import { cutText, generateAmaId, getIdFromUrl } from "@/lib/utils";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    checkAccess(["TRANSACTION"], "CREATE");
    const companyId = getIdFromUrl(req.url, 2);
    const type = req.nextUrl.searchParams.get("type")?.trim() ?? "";

    if (!companyId) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide.",
        }, { status: 404 });
    }

    if (type === "receipt") {
        const invoices = await prisma.invoice.findMany({
            where: {
                companyId,
                isPaid: false,
            },
            select: {
                id: true,
                amountType: true,
                totalHT: true,
                totalTTC: true,
                payee: true,
                invoiceNumber: true,
                company: {
                    select: {
                        currency: true,
                        documentModel: {
                            select: {
                                invoicesPrefix: true
                            }
                        }
                    }
                },

            }
        });

        const parsedInvoices = invoices.map(invoice => ({
            id: invoice.id,
            type: 'Facture',
            amountType: invoice.amountType,
            reference: `${invoice.company.documentModel?.invoicesPrefix ?? INVOICE_PREFIX}-${generateAmaId(invoice.invoiceNumber, false)}`,
            price: invoice.amountType === "TTC" ? invoice.totalTTC.toString() : invoice.totalHT.toString(),
            payee: new Decimal(invoice.amountType === "TTC" ? invoice.totalTTC.toString() : invoice.totalHT.toString()).minus(invoice.payee.toString()).toString(),
            currency: invoice.company.currency,
        }));

        const documents = [...parsedInvoices];

        return NextResponse.json({
            state: "success",
            data: documents,
        }, { status: 200 })

    } else {
        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where: {
                companyId,
                isPaid: false,
            },
            select: {
                id: true,
                amountType: true,
                totalHT: true,
                totalTTC: true,
                payee: true,
                purchaseOrderNumber: true,
                supplier: true,
                company: {
                    select: {
                        currency: true,
                        documentModel: {
                            select: {
                                purchaseOrderPrefix: true
                            }
                        }
                    }
                },
            }
        });

        const parsedPurchaseOrder = purchaseOrders.map(purchaseOrder => ({
            id: purchaseOrder.id,
            amountType: purchaseOrder.amountType,
            type: cutText(`${purchaseOrder.supplier?.firstname} ${purchaseOrder.supplier?.lastname}`),
            reference: `${purchaseOrder.company.documentModel?.purchaseOrderPrefix ?? PURCHASE_ORDER_PREFIX}-${generateAmaId(purchaseOrder.purchaseOrderNumber, false)}`,
            price: purchaseOrder.amountType === "TTC" ? purchaseOrder.totalTTC.toString() : purchaseOrder.totalHT.toString(),
            payee: new Decimal(purchaseOrder.amountType === "TTC" ? purchaseOrder.totalTTC.toString() : purchaseOrder.totalHT.toString()).minus(purchaseOrder.payee.toString()).toString(),
            currency: purchaseOrder.company.currency,
        }));

        const documents = [...parsedPurchaseOrder];

        return NextResponse.json({
            state: "success",
            data: documents,
        }, { status: 200 })

    }
}