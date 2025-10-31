import Decimal from "decimal.js";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

function formatAmount(dec: Decimal): string {
    // si entier -> sans décimales, sinon 2 décimales
    try {
        return dec.isInteger() ? dec.toFixed(0) : dec.toFixed(2);
    } catch {
        // fallback
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

        // base where for queries
        const baseWhere: any = { companyId: id };
        if (start || end) baseWhere.createdAt = whereCreatedAt;
        if (category) baseWhere.categoryId = category;

        // 1) total général (somme sur amount)
        const totalAgg = await prisma.dibursement.aggregate({
            where: baseWhere,
            _sum: { amount: true },
        });
        const totalAmountDecimal = new Decimal(
            totalAgg._sum?.amount?.toString() ?? 0
        );

        // 2) somme par catégorie (groupBy)
        const sumsByCategory = await prisma.dibursement.groupBy({
            by: ["categoryId"],
            where: baseWhere,
            _sum: { amount: true },
        });

        // 3) récupérer les catégories concernées (pour avoir le nom)
        const categoryIds = sumsByCategory.map((r) => r.categoryId).filter(Boolean);
        const categories = categoryIds.length
            ? await prisma.transactionCategory.findMany({
                where: { companyId: id, id: { in: categoryIds } },
                select: { id: true, name: true },
            })
            : [];

        const catNameMap: Record<string, string> = {};
        for (const c of categories) catNameMap[c.id] = c.name;

        // 4) construire le tableau final (formatage conditionnel)
        const items = sumsByCategory.map((row) => {
            const amt = new Decimal(row._sum.amount?.toString() ?? 0);
            return {
                categoryId: row.categoryId,
                categoryName: catNameMap[row.categoryId] ?? "Inconnue",
                total: formatAmount(amt), // string formatée
            };
        });

        // trier par total décroissant (en décimal)
        items.sort((a, b) => {
            const da = new Decimal(a.total.replace(",", "."));
            const db = new Decimal(b.total.replace(",", "."));
            if (da.lt(db)) return 1;
            if (da.gt(db)) return -1;
            return 0;
        });

        return NextResponse.json(
            {
                state: "success",
                data: {
                    total: formatAmount(totalAmountDecimal),
                    items,
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
