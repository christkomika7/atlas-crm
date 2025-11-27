import { ADMINISTRATION_CATEGORY, FISCAL_NATURE, FISCAL_OBJECT } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { TaxInput } from "@/types/tax.type";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const res = await checkAccess("DASHBOARD", ["READ"]);

    if (!res.authorized) {
        return Response.json({
            status: "error",
            message: res.message,
            data: []
        }, { status: 200 });
    }

    const companyId = req.nextUrl.searchParams.get("companyId") as string;

    if (!companyId) {
        return NextResponse.json(
            { status: "error", message: "Identifiant invalide." },
            { status: 404 }
        );
    }

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
        return NextResponse.json(
            { status: "error", message: "Entreprise introuvable." },
            { status: 404 }
        );
    }

    const vats: TaxInput[] = Array.isArray(company.vatRates)
        ? (company.vatRates as any[])
        : typeof company.vatRates === "string"
            ? JSON.parse(company.vatRates || "[]")
            : [];

    const tvaEntry = vats.find(
        (v) => typeof v.taxName === "string" && v.taxName.toLowerCase() === "tva"
    );

    if (!tvaEntry) {
        return NextResponse.json(
            {
                status: "success",
                message: "Aucun taux de TVA défini pour cette entreprise.",
                data: 0,
            },
            { status: 200 }
        );
    }

    const parsePercent = (s: string | number | undefined): Decimal => {
        if (!s && s !== 0) return new Decimal(0);
        try {
            if (typeof s === "number") return new Decimal(s).div(100);
            const cleaned = String(s).replace(/[%\s]/g, "");
            if (cleaned === "") return new Decimal(0);
            return new Decimal(cleaned).div(100);
        } catch {
            return new Decimal(0);
        }
    };

    const tvaRate = parsePercent(tvaEntry.taxValue);

    if (tvaRate.equals(0)) {
        return NextResponse.json(
            {
                status: "success",
                message: "Aucun taux de TVA actif (0%).",
                data: 0,
            },
            { status: 200 }
        );
    }

    // TVA COLLECTÉE : TVA sur les factures (ventes)
    // On prend les factures en TTC et on recalcule la TVA
    const invoicesSum = await prisma.invoice.aggregate({
        _sum: { totalTTC: true },
        where: {
            companyId,
        },
    });

    // TVA DÉDUCTIBLE : TVA sur les bons de commande (achats)
    // On prend les bons de commande en TTC et on recalcule la TVA
    const purchaseOrdersSum = await prisma.purchaseOrder.aggregate({
        _sum: { totalTTC: true },
        where: {
            companyId,
        },
    });

    // TVA PAYÉE : Décaissements fiscaux
    // Cela représente les paiements de TVA déjà effectués
    const fiscalDisbursementsSum = await prisma.dibursement.aggregate({
        _sum: { amount: true },
        where: {
            companyId,
            amountType: "HT",
            category: { name: { equals: ADMINISTRATION_CATEGORY, mode: "insensitive" } },
            nature: { name: { equals: FISCAL_NATURE, mode: "insensitive" } },
            fiscalObject: { name: { equals: FISCAL_OBJECT, mode: "insensitive" } }
        },
    });

    const totalInvoicesTTC = new Decimal(invoicesSum._sum.totalTTC?.toString() ?? 0);
    const totalPurchaseOrdersTTC = new Decimal(purchaseOrdersSum._sum.totalTTC?.toString() ?? 0);
    const totalFiscalPaid = new Decimal(fiscalDisbursementsSum._sum.amount?.toString() ?? 0);

    if (totalInvoicesTTC.equals(0) && totalPurchaseOrdersTTC.equals(0) && totalFiscalPaid.equals(0)) {
        return NextResponse.json(
            {
                status: "success",
                message: "",
                data: 0,
            },
            { status: 200 }
        );
    }

    const tvaCollected = totalInvoicesTTC.mul(tvaRate).div(new Decimal(1).add(tvaRate));

    const tvaDeductible = totalPurchaseOrdersTTC.mul(tvaRate).div(new Decimal(1).add(tvaRate));

    const tvaDue = tvaCollected.sub(tvaDeductible).sub(totalFiscalPaid);

    return NextResponse.json(
        {
            status: "success",
            message: "",
            data: tvaDue.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber(),
        },
        { status: 200 }
    );
}