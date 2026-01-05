import { checkAccess } from "@/lib/access";
import { formatDecimal, generateAmaId, getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Decimal } from "decimal.js";
import { differenceInDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { INVOICE_PREFIX } from "@/config/constant";
import { dueDate } from "@/lib/date";

export async function GET(req: NextRequest) {
    const resultAccess = await checkAccess("CLIENTS", "READ");
    if (!resultAccess.authorized) {
        return NextResponse.json(
            { state: "error", message: resultAccess.message },
            { status: 403 }
        );
    }

    const clientId = getIdFromUrl(req.url, 2);
    if (!clientId) {
        return NextResponse.json(
            { state: "error", message: "clientId manquant dans l'URL" },
            { status: 400 }
        );
    }

    const hasNoInvoicePaid = req.nextUrl.searchParams
        .get("hasNoInvoicePaid")
        ?.trim() as "yes" | "no" | undefined;

    const startParam = req.nextUrl.searchParams.get("start")?.trim();
    const endParam = req.nextUrl.searchParams.get("end")?.trim();

    const now = new Date();

    let startDate: Date;
    let endDate: Date;

    if (startParam) {
        startDate = startOfDay(parseISO(startParam));
    } else {
        startDate = startOfDay(now);
    }

    if (endParam) {
        endDate = endOfDay(parseISO(endParam));
    } else {
        endDate = endOfDay(now);
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
            { state: "error", message: "Format de date invalide" },
            { status: 400 }
        );
    }

    if (startDate.getTime() > endDate.getTime()) {
        return NextResponse.json(
            { state: "error", message: "start doit être antérieur ou égal à end" },
            { status: 400 }
        );
    }

    try {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            include: {
                invoices: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                company: {
                    include: {
                        documentModel: true,
                    }
                }
            },
        });

        if (!client) {
            return NextResponse.json(
                { state: "error", message: "Client introuvable" },
                { status: 404 }
            );
        }

        let initialBalance = new Decimal(0);
        client.invoices.forEach((inv) => {
            const invDate = new Date(inv.createdAt);
            if (invDate.getTime() < startDate.getTime()) {
                const totalTTC = new Decimal(inv.totalTTC.toString());
                const payee = new Decimal(inv.payee.toString());
                const remaining = totalTTC.minus(payee);
                initialBalance = initialBalance.plus(remaining);
            }
        });

        const filteredInvoices = client.invoices.filter((inv) => {
            const invDate = new Date(inv.createdAt);

            if (invDate.getTime() < startDate.getTime() || invDate.getTime() > endDate.getTime()) {
                return false;
            }

            if (hasNoInvoicePaid === "yes") {
                return !inv.isPaid;
            }
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

        const invoices = filteredInvoices.map((inv) => {
            const invoiceTotalTTC = new Decimal(inv.totalTTC.toString());
            const payee = new Decimal(inv.payee.toString());
            const remaining = invoiceTotalTTC.minus(payee);

            totalTTC = totalTTC.plus(invoiceTotalTTC);
            totalPaid = totalPaid.plus(payee);
            totalDue = totalDue.plus(remaining);

            const invoiceDate = new Date(inv.createdAt);

            let daysLimit = 0;
            if (inv.paymentLimit) {
                const match = inv.paymentLimit.match(/(\d+)/);
                if (match) {
                    daysLimit = parseInt(match[1], 10);
                } else {
                    daysLimit = parseInt(inv.paymentLimit) || 0;
                }
            }

            const delayDate = new Date(invoiceDate);
            delayDate.setDate(delayDate.getDate() + daysLimit);

            const daysLate = differenceInDays(now, delayDate);

            if (remaining.greaterThan(0)) {
                if (daysLate <= 0) {
                    payableToday = payableToday.plus(remaining);
                } else if (daysLate >= 1 && daysLate <= 30) {
                    delay1to30 = delay1to30.plus(remaining);
                } else if (daysLate >= 31 && daysLate <= 60) {
                    delay31to60 = delay31to60.plus(remaining);
                } else if (daysLate >= 61 && daysLate <= 90) {
                    delay61to90 = delay61to90.plus(remaining);
                } else if (daysLate >= 91) {
                    delayOver91 = delayOver91.plus(remaining);
                }
            }

            const echeance = dueDate(inv.createdAt, inv.paymentLimit);

            return {
                reference: `${client.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(inv.invoiceNumber, false)}`,
                echeance: echeance,
                statut: inv.isPaid,
                totalTTC: formatDecimal(invoiceTotalTTC),
                amountType: inv.amountType,
                payee: formatDecimal(payee),
            };
        });

        return NextResponse.json({
            state: "success",
            data: {
                invoices,
                initialBalance: formatDecimal(initialBalance),
                totalTTC: formatDecimal(totalTTC),
                totalPaid: formatDecimal(totalPaid),
                totalDue: formatDecimal(totalDue),
                payableToday: formatDecimal(payableToday),
                delay1to30: formatDecimal(delay1to30),
                delay31to60: formatDecimal(delay31to60),
                delay61to90: formatDecimal(delay61to90),
                delayOver91: formatDecimal(delayOver91),
                client,
                startDate,
                endDate
            },
        });
    } catch (error) {
        console.error("Erreur dans GET /api/clients/[id]/invoices:", error);
        return NextResponse.json(
            { state: "error", message: error instanceof Error ? error.message : "Erreur inconnue" },
            { status: 500 }
        );
    }
}