import { checkAccess } from "@/lib/access";
import { NextRequest, NextResponse } from "next/server";
import { addDays, differenceInDays, isBefore, isAfter } from "date-fns";
import { paymentTerms } from "@/lib/data";

import prisma from "@/lib/prisma";
import Decimal from "decimal.js";


function checkDeadline(range: [Date, Date]) {
    const [start, end] = range;
    const now = new Date();

    const daysLeft = differenceInDays(end, now);
    const isOutside = isBefore(now, start) || isAfter(now, end);

    return { daysLeft, isOutside, now, end, start };
}

export async function GET(req: NextRequest) {
    const result = await checkAccess("DASHBOARD", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const companyId = req.nextUrl.searchParams.get("companyId") as string;

    if (!companyId) {
        return NextResponse.json(
            { status: "error", message: "Identifiant invalide" },
            { status: 404 }
        );
    }

    try {
        const invoices = await prisma.invoice.findMany({
            where: { companyId },
            orderBy: { createdAt: "desc" },
        });

        let sumUnpaid = new Decimal(0);
        let sumTotal = new Decimal(0);
        let unpaidCount = 0;

        const overdueInvoices: any[] = [];

        for (const inv of invoices) {
            const amountType = (inv.amountType ?? "TTC").toString();
            const totalRaw = amountType === "TTC" ? (inv.totalTTC ?? 0) : (inv.totalHT ?? 0);
            const payeeRaw = inv.payee ?? 0;

            const total = new Decimal(typeof totalRaw === "string" ? totalRaw : totalRaw.toString());
            const paid = new Decimal(typeof payeeRaw === "string" ? payeeRaw : payeeRaw.toString());
            const remainder = Decimal.max(total.minus(paid), new Decimal(0));

            const invoiceDate = inv.createdAt ? new Date(inv.createdAt) : new Date();
            const dueKey = (inv.paymentLimit ?? "").toString();
            const days = (paymentTerms.find((p) => p.value === dueKey)?.data) ?? 0;
            const start = invoiceDate;
            const end = addDays(start, days);

            const { daysLeft, now } = checkDeadline([start, end]);

            const isOverdue = isAfter(now, end);

            if (isOverdue && remainder.gt(0)) {
                sumUnpaid = sumUnpaid.plus(remainder);
                sumTotal = sumTotal.plus(total);
                unpaidCount++;

                overdueInvoices.push({
                    ...inv,
                    invoiceTotal: total.toString(),
                    paid: paid.toString(),
                    unpaid: remainder.toString(),
                    dueDays: days,
                    invoiceDate: start.toISOString(),
                    dueDate: end.toISOString(),
                    daysLeft,
                    isOverdue,
                });
            }
        }

        const percentageUnpaid = sumTotal.isZero()
            ? 0
            : parseFloat(sumUnpaid.div(sumTotal).times(100).toFixed(2));

        return NextResponse.json(
            {
                state: "success",
                data: {
                    sumUnpaid: sumUnpaid.toString(),
                    percentageUnpaid,
                },
            },
            { status: 200 }
        );

    } catch (e) {
        console.error(e)
        return NextResponse.json({
            status: "error",
            message: "",
        }, { status: 500 });
    }

}
