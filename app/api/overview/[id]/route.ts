import { DELIVERY_NOTE_PREFIX, INVOICE_PREFIX, PURCHASE_ORDER_PREFIX, QUOTE_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { generateAmaId, getIdFromUrl } from "@/lib/utils";
import { RecordType } from "@/types/overview.type";
import Decimal from "decimal.js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "READ");
    const companyId = getIdFromUrl(req.url, "last") as string;

    if (!companyId) {
        return NextResponse.json({
            state: "error",
            message: "Aucune entreprise trouvée.",
        }, { status: 404 });
    }

    const [invoices, purchaseOrders, quotes, deliveryNotes] = await prisma.$transaction([
        prisma.invoice.findMany({
            where: { companyId },
            include: { client: true, company: { include: { documentModel: true } } },
            take: 3,
            orderBy: { createdAt: "desc" },
        }),
        prisma.purchaseOrder.findMany({
            where: { companyId },
            include: { supplier: true, company: { include: { documentModel: true } } },
            take: 3,
            orderBy: { createdAt: "desc" },
        }),
        prisma.quote.findMany({
            where: { companyId },
            include: { client: true, company: { include: { documentModel: true } } },
            take: 3,
            orderBy: { createdAt: "desc" },
        }),
        prisma.deliveryNote.findMany({
            where: { companyId },
            include: { client: true, company: { include: { documentModel: true } } },
            take: 3,
            orderBy: { createdAt: "desc" },
        }),

    ]);

    const datas: RecordType[] = [
        ...invoices.map(record => ({
            id: record.id,
            type: "invoice",
            reference: `${record.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(record.invoiceNumber, false)}`,
            company: `${record.client?.companyName}`,
            forUser: `${record.client?.lastname} ${record.client?.firstname}`,
            amountPaid: new Decimal(record.payee.toString()),
            amountUnpaid: record.amountType === "TTC" ?
                new Decimal(record.totalTTC.toString()).minus(record.payee.toString()) :
                new Decimal(record.totalHT.toString()).minus(record.payee.toString()),
            status: record.isPaid ? "PAID" : !record.isPaid && new Decimal(record.payee.toString()).gt(0) ? "PENDING" : "WAIT"
        })),
        ...purchaseOrders.map(record => ({
            id: record.id,
            type: "purchase-order",
            reference: `${record.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(record.purchaseOrderNumber, false)}`,
            company: `${record.supplier?.companyName}`,
            forUser: `${record.supplier?.lastname} ${record.supplier?.firstname}`,
            amountPaid: new Decimal(record.payee.toString()),
            amountUnpaid: record.amountType === "TTC" ?
                new Decimal(record.totalTTC.toString()).minus(record.payee.toString()) :
                new Decimal(record.totalHT.toString()).minus(record.payee.toString()),
            status: record.isPaid ? "PAID" : !record.isPaid && new Decimal(record.payee.toString()).gt(0) ? "PENDING" : "WAIT"


        })),
        ...quotes.map(record => ({
            id: record.id,
            type: "quote",
            reference: `${record.company.documentModel?.quotesPrefix || QUOTE_PREFIX}-${generateAmaId(record.quoteNumber, false)}`,
            company: `${record.client?.companyName}`,
            forUser: `${record.client?.lastname} ${record.client?.firstname}`,
            amountPaid: new Decimal(0),
            amountUnpaid: new Decimal(0),
            status: record.isCompleted ? "PAID" : "WAIT"

        })),
        ...deliveryNotes.map(record => ({
            id: record.id,
            type: "delivery-note",
            reference: `${record.company.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(record.deliveryNoteNumber, false)}`,
            company: `${record.client?.companyName}`,
            forUser: `${record.client?.lastname} ${record.client?.firstname}`,
            amountPaid: new Decimal(0),
            amountUnpaid: new Decimal(0),
            status: record.isCompleted ? "PAID" : "WAIT"
        })),
    ];

    return NextResponse.json({
        state: "success",
        data: datas,
    }, { status: 200 })
}