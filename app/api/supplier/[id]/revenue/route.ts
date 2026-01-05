import { checkAccess } from "@/lib/access";
import { formatDecimal, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { differenceInDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { dueDate } from "@/lib/date";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";

export async function GET(req: NextRequest) {
    const resultAccess = await checkAccess("SUPPLIERS", "READ");
    if (!resultAccess.authorized) {
        return NextResponse.json(
            { state: "error", message: resultAccess.message },
            { status: 403 }
        );
    }

    const supplierId = getIdFromUrl(req.url, 2);
    if (!supplierId) {
        return NextResponse.json(
            { state: "error", message: "supplierId manquant dans l'URL" },
            { status: 400 }
        );
    }

    const hasNoInvoicePaid = req.nextUrl.searchParams
        .get("hasNoInvoicePaid")
        ?.trim() as "yes" | "no" | undefined;

    const startParam = req.nextUrl.searchParams.get("start")?.trim();
    const endParam = req.nextUrl.searchParams.get("end")?.trim();

    const now = new Date();

    const startDate = startParam
        ? startOfDay(parseISO(startParam))
        : startOfDay(now);

    const endDate = endParam
        ? endOfDay(parseISO(endParam))
        : endOfDay(now);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
            { state: "error", message: "Format de date invalide" },
            { status: 400 }
        );
    }

    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            include: {
                purchaseOrders: {
                    orderBy: { createdAt: "asc" }
                },
                company: {
                    include: { documentModel: true }
                }
            }
        });

        if (!supplier) {
            return NextResponse.json(
                { state: "error", message: "Fournisseur introuvable" },
                { status: 404 }
            );
        }

        let initialBalance = new Decimal(0);
        supplier.purchaseOrders.forEach(po => {
            if (new Date(po.createdAt) < startDate) {
                initialBalance = initialBalance.plus(
                    new Decimal(po.totalTTC.toString()).minus(po.payee.toString())
                );
            }
        });

        const filteredOrders = supplier.purchaseOrders.filter(po => {
            const d = new Date(po.createdAt);
            if (d < startDate || d > endDate) return false;
            if (hasNoInvoicePaid === "yes") return !po.isPaid;
            return true;
        });

        let totalTTC = new Decimal(0);
        let totalPaid = new Decimal(0);
        let totalDue = new Decimal(0);

        let payableToday = new Decimal(0);
        let delay1to30 = new Decimal(0);
        let delay31to60 = new Decimal(0);
        let delay61to90 = new Decimal(0);
        let delayOver91 = new Decimal(0);

        const purchaseOrders = filteredOrders.map(po => {
            const ttc = new Decimal(po.totalTTC.toString());
            const paid = new Decimal(po.payee.toString());
            const remaining = ttc.minus(paid);

            totalTTC = totalTTC.plus(ttc);
            totalPaid = totalPaid.plus(paid);
            totalDue = totalDue.plus(remaining);

            let daysLimit = 0;
            if (po.paymentLimit) {
                const match = po.paymentLimit.match(/(\d+)/);
                if (match) daysLimit = parseInt(match[1], 10);
            }

            const due = new Date(po.createdAt);
            due.setDate(due.getDate() + daysLimit);

            const daysLate = differenceInDays(now, due);

            if (remaining.gt(0)) {
                if (daysLate <= 0) payableToday = payableToday.plus(remaining);
                else if (daysLate <= 30) delay1to30 = delay1to30.plus(remaining);
                else if (daysLate <= 60) delay31to60 = delay31to60.plus(remaining);
                else if (daysLate <= 90) delay61to90 = delay61to90.plus(remaining);
                else delayOver91 = delayOver91.plus(remaining);
            }

            return {
                reference: `${supplier.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(po.purchaseOrderNumber, false)}`,
                echeance: dueDate(po.createdAt, po.paymentLimit),
                statut: po.isPaid,
                totalTTC: formatDecimal(ttc),
                amountType: po.amountType,
                payee: formatDecimal(paid)
            };
        });

        return NextResponse.json({
            state: "success",
            data: {
                purchaseOrders,
                initialBalance: formatDecimal(initialBalance),
                totalTTC: formatDecimal(totalTTC),
                totalPaid: formatDecimal(totalPaid),
                totalDue: formatDecimal(totalDue),
                payableToday: formatDecimal(payableToday),
                delay1to30: formatDecimal(delay1to30),
                delay31to60: formatDecimal(delay31to60),
                delay61to90: formatDecimal(delay61to90),
                delayOver91: formatDecimal(delayOver91),
                supplier,
                startDate,
                endDate
            }
        });
    } catch (error) {
        console.error("Erreur GET supplier purchaseOrders:", error);
        return NextResponse.json(
            { state: "error", message: "Erreur serveur" },
            { status: 500 }
        );
    }
}
