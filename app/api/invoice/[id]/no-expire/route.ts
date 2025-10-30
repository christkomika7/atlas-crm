import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import Decimal from "decimal.js";

export async function GET(req: NextRequest) {
    await checkAccess(["INVOICES"], "READ");
    const companyId = getIdFromUrl(req.url, 2) as string;

    if (!companyId) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide",
        }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
        where: {
            companyId,
        },
        orderBy: { createdAt: "desc" },
    });

    let sumUnpaid = new Decimal(0);
    let sumTotal = new Decimal(0);
    let unpaidCount = 0;

    invoices.map(inv => {
        const total = new Decimal(
            (inv.amountType === "TTC" ? inv.totalTTC.toString() : inv.totalHT.toString()) ?? 0
        );
        const paid = new Decimal(inv.payee.toString() ?? 0);

        const remainder = Decimal.max(total.minus(paid), new Decimal(0));

        sumTotal = sumTotal.plus(total);

        if (remainder.gt(0)) {
            sumUnpaid = sumUnpaid.plus(remainder);
            unpaidCount++;
        }

        return {
            ...inv,
            unpaid: remainder.toString(),
            invoiceTotal: total.toString(),
            paid: paid.toString(),
        };
    });

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
}
