import { ADMINISTRATION_CATEGORY, FISCAL_NATURE, FISCAL_OBJECT } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
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


    const id = getIdFromUrl(req.url, 2) as string;

    if (!id) {
        return NextResponse.json(
            { status: "error", message: "Identifiant invalide." },
            { status: 404 }
        );
    }

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
        return NextResponse.json(
            { status: "error", message: "Entreprise introuvable." },
            { status: 404 }
        );
    }

    // -------- TVA --------
    const vats: TaxInput[] = Array.isArray(company.vatRates)
        ? (company.vatRates as any[])
        : typeof company.vatRates === "string"
            ? JSON.parse(company.vatRates || "[]")
            : [];

    const tvaEntry = vats.find(
        (v) => typeof v.taxName === "string" && v.taxName.toLowerCase() === "tva"
    );

    // Aucune TVA enregistrée
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

    // TVA = 0%
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

    // -------- SUMS --------
    const receiptsSum = await prisma.receipt.aggregate({
        _sum: { amount: true },
        where: {
            companyId: id,
            amountType: "TTC",
        },
    });

    const dibursementsSum = await prisma.dibursement.aggregate({
        _sum: { amount: true },
        where: {
            companyId: id,
            amountType: "TTC",
        },
    });

    const fiscalDibursementsSum = await prisma.dibursement.aggregate({
        _sum: { amount: true },
        where: {
            companyId: id,
            amountType: "HT",
            category: { name: { equals: ADMINISTRATION_CATEGORY, mode: "insensitive" } },
            nature: { name: { equals: FISCAL_NATURE, mode: "insensitive" } },
            fiscalObject: { name: { equals: FISCAL_OBJECT, mode: "insensitive" } }
        },
    });

    const totalReceipts = new Decimal(receiptsSum._sum.amount?.toString() ?? 0);
    const totalDibursements = new Decimal(dibursementsSum._sum.amount?.toString() ?? 0);
    const totalFiscal = new Decimal(fiscalDibursementsSum._sum.amount?.toString() ?? 0);

    // Aucun mouvement enregistré
    if (totalReceipts.equals(0) && totalDibursements.equals(0) && totalFiscal.equals(0)) {
        return NextResponse.json(
            {
                status: "success",
                message: "",
                data: 0,
            },
            { status: 200 }
        );
    }

    // -------- TVA CALCULATION --------
    const tvaOnReceipts = totalReceipts.mul(tvaRate);
    const tvaOnDibursements = totalDibursements.mul(tvaRate);

    const result = tvaOnReceipts.sub(tvaOnDibursements).abs().sub(totalFiscal);

    return NextResponse.json(
        {
            status: "success",
            message: "",
            data: result,
        },
        { status: 200 }
    );
}
