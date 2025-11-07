import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { TaxInput } from "@/types/tax.type";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    if (!id) {
        return NextResponse.json(
            { status: "error", message: "identifiant invalide." },
            { status: 404 }
        );
    }

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
        return NextResponse.json(
            { status: "error", message: "identifiant invalide." },
            { status: 404 }
        );
    }

    // Récupérer la liste des taxes et la TVA (cas où vatRates est un array)
    const vats: TaxInput[] = Array.isArray(company.vatRates)
        ? (company.vatRates as any[])
        : typeof company.vatRates === "string"
            ? JSON.parse(company.vatRates || "[]")
            : [];

    const tvaEntry = vats.find(
        (v) => typeof v.taxName === "string" && v.taxName.toLowerCase() === "tva"
    );

    // parse TVA pour obtenir un ratio (ex: "2%" -> 0.02). Défaut 0 si absent.
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

    const tvaRate = parsePercent(tvaEntry?.taxValue);

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
            category: {
                name: {
                    equals: "Administration",
                    mode: "insensitive"
                }
            },
            nature: {
                name: {
                    equals: "Fiscale",
                    mode: "insensitive"
                }
            },
            fiscalObject: {
                name: {
                    equals: "TVA",
                    mode: "insensitive"
                }
            }
        },
    });

    const totalReceipts = new Decimal(receiptsSum._sum.amount?.toString() ?? 0);
    const totalDibursements = new Decimal(dibursementsSum._sum.amount?.toString() ?? 0);
    const totalFiscal = new Decimal(fiscalDibursementsSum._sum.amount?.toString() ?? 0);

    const tvaOnReceipts = totalReceipts.mul(tvaRate);
    const tvaOnDibursements = totalDibursements.mul(tvaRate);
    const result = tvaOnReceipts.sub(tvaOnDibursements).sub(totalFiscal);

    return NextResponse.json(
        {
            status: "success",
            data: result,
        },
        { status: 200 }
    );
}
