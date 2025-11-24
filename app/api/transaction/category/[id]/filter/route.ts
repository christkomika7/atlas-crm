import Decimal from "decimal.js";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";
import { $Enums } from "@/lib/generated/prisma";

function formatAmount(dec: Decimal): string {
    try {
        return dec.isInteger() ? dec.toFixed(0) : dec.toFixed(2);
    } catch {
        return dec.toFixed(2);
    }
}

export async function GET(req: NextRequest) {
    try {
        await checkAccess(["DASHBOARD"], "READ");

        const id = getIdFromUrl(req.url, 3) as string;
        if (!id) {
            return NextResponse.json(
                { status: "error", message: "identifiant invalide." },
                { status: 404 }
            );
        }

        // query params
        const start = req.nextUrl.searchParams.get("start")?.trim() ?? undefined;
        const end = req.nextUrl.searchParams.get("end")?.trim() ?? undefined;
        const category = req.nextUrl.searchParams.get("category")?.trim() ?? "";

        // build createdAt filter (apply on createdAt of the transaction)
        const whereCreatedAt: any = {};
        if (start) {
            const d = new Date(start);
            if (!isNaN(d.getTime())) whereCreatedAt.gte = d;
        }
        if (end) {
            const d = new Date(end);
            if (!isNaN(d.getTime())) {
                d.setHours(23, 59, 59, 999);
                whereCreatedAt.lte = d;
            }
        }

        // base where for dibursement queries
        const baseWhere: any = { companyId: id, type: $Enums.TransactionType.DISBURSEMENT };
        if (start || end) baseWhere.createdAt = whereCreatedAt;
        if (category) baseWhere.categoryId = category;

        // --- 1) total général (somme sur amount) pour les dibursements (selon filtres) ---
        const totalAgg = await prisma.dibursement.aggregate({
            where: baseWhere,
            _sum: { amount: true },
        });
        const totalAmountDecimal = new Decimal(totalAgg._sum?.amount?.toString() ?? "0");

        // --- 2) somme par catégorie (groupBy) ---
        const sumsByCategory = await prisma.dibursement.groupBy({
            by: ["categoryId"],
            where: { companyId: id, type: $Enums.TransactionType.DISBURSEMENT, ...(start || end ? { createdAt: whereCreatedAt } : {}) },
            _sum: { amount: true },
        });

        // récupérer toutes les catégories de type DISBURSEMENT pour la company
        const allCategories = await prisma.transactionCategory.findMany({
            where: { companyId: id, type: $Enums.TransactionType.DISBURSEMENT },
            select: { id: true, name: true },
        });
        const catNameMap: Record<string, string> = {};
        for (const c of allCategories) catNameMap[c.id] = c.name;

        // construire itemsRaw pour tri (garder Decimal)
        const itemsRaw: Array<{
            categoryId: string | null;
            categoryName: string;
            totalDecimal: Decimal;
        }> = sumsByCategory.map((row) => {
            const amt = new Decimal(row._sum.amount?.toString() ?? "0");
            return {
                categoryId: row.categoryId ?? null,
                categoryName: row.categoryId ? (catNameMap[row.categoryId] ?? "Inconnue") : "Inconnue",
                totalDecimal: amt,
            };
        });

        // trier par montant décroissant
        itemsRaw.sort((a, b) => {
            if (a.totalDecimal.lt(b.totalDecimal)) return 1;
            if (a.totalDecimal.gt(b.totalDecimal)) return -1;
            return 0;
        });

        // mapper vers la forme finale (sans champs internes)
        const items = itemsRaw.map((it) => ({
            categoryId: it.categoryId,
            categoryName: it.categoryName,
            total: formatAmount(it.totalDecimal),
        }));

        // --- 3) si category param est fourni : calculer sommes par nature pour cette catégorie + pourcentage ---
        let naturesResult: Array<{ natureId: string; name: string; total: string; percent: string }> = [];

        if (category) {
            // somme totale pour cette catégorie (respecte filtres date)
            const totalForCategoryAgg = await prisma.dibursement.aggregate({
                where: { companyId: id, type: $Enums.TransactionType.DISBURSEMENT, categoryId: category, ...(start || end ? { createdAt: whereCreatedAt } : {}) },
                _sum: { amount: true },
            });
            const totalForCategory = new Decimal(totalForCategoryAgg._sum?.amount?.toString() ?? "0");

            // groupBy natureId
            const sumsByNature = await prisma.dibursement.groupBy({
                by: ["natureId"],
                where: { companyId: id, type: $Enums.TransactionType.DISBURSEMENT, categoryId: category, ...(start || end ? { createdAt: whereCreatedAt } : {}) },
                _sum: { amount: true },
            });

            const natureIds = sumsByNature.map((r) => r.natureId).filter(Boolean) as string[];
            const natures = natureIds.length
                ? await prisma.transactionNature.findMany({
                    where: { companyId: id, id: { in: natureIds } },
                    select: { id: true, name: true },
                })
                : [];

            const natureNameMap: Record<string, string> = {};
            for (const n of natures) natureNameMap[n.id] = n.name;

            // construire naturesRaw pour tri (garder Decimal)
            const naturesRaw: Array<{
                natureId: string | null;
                name: string;
                totalDecimal: Decimal;
            }> = sumsByNature.map((row) => {
                const amt = new Decimal(row._sum.amount?.toString() ?? "0");
                return {
                    natureId: row.natureId ?? null,
                    name: row.natureId ? (natureNameMap[row.natureId] ?? "Inconnue") : "Sans nature",
                    totalDecimal: amt,
                };
            });

            // trier natures par montant décroissant
            naturesRaw.sort((a, b) => {
                if (a.totalDecimal.lt(b.totalDecimal)) return 1;
                if (a.totalDecimal.gt(b.totalDecimal)) return -1;
                return 0;
            });

            // mapper vers résultat final avec pourcentage
            naturesResult = naturesRaw.map((n) => {
                const percent = totalForCategory.isZero() ? new Decimal(0) : n.totalDecimal.div(totalForCategory).times(100);
                return {
                    natureId: n.natureId ?? Date.now().toString(),
                    name: n.name,
                    total: formatAmount(n.totalDecimal),
                    percent: `${percent.toFixed(2)}%`,
                };
            });
        }

        return NextResponse.json(
            {
                state: "success",
                data: {
                    total: formatAmount(totalAmountDecimal),
                    categories: items,
                    natures: category ? naturesResult : []
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("GET /dibursements/stat", error);
        return NextResponse.json(
            { state: "error", message: error?.message ?? "Erreur serveur." },
            { status: 500 }
        );
    }
}
