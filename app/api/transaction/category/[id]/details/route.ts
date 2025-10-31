import Decimal from "decimal.js";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // vérification d'accès (garde ou modifie selon tes besoins)
    await checkAccess(["DASHBOARD"], "READ");

    const id = getIdFromUrl(req.url, 3) as string;

    if (!id) {
        return NextResponse.json(
            { status: "error", message: "identifiant invalide." },
            { status: 404 }
        );
    }

    // 1) total général des dibursements (Decimal from Prisma)
    const totalAgg = await prisma.dibursement.aggregate({
        where: { companyId: id },
        _sum: { amount: true },
    });

    // Prisma Decimal (or null) -> Decimal.js
    const totalAmountDecimal = new Decimal(totalAgg._sum?.amount?.toString() ?? 0);

    // 2) somme par catégorie (groupBy)
    const sumsByCategory = await prisma.dibursement.groupBy({
        by: ["categoryId"],
        where: { companyId: id },
        _sum: { amount: true },
    });

    // construire map categoryId => Decimal sum
    const sumsMap: Record<string, Decimal> = {};
    for (const row of sumsByCategory) {
        const amt = new Decimal(row._sum.amount?.toString() ?? 0);
        sumsMap[row.categoryId] = amt;
    }

    // 3) récupérer toutes les catégories de la société
    const categories = await prisma.transactionCategory.findMany({
        where: { companyId: id },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    // 4) construire résultat final : total (string) et pourcentage (string)
    const result = categories.map((cat) => {
        const catTotal = sumsMap[cat.id] ?? new Decimal(0);

        const percentageDecimal =
            totalAmountDecimal.equals(0)
                ? new Decimal(0)
                : catTotal.dividedBy(totalAmountDecimal).times(100);

        return {
            categoryId: cat.id,
            categoryName: cat.name,
            total: catTotal,
            percentage: percentageDecimal,
        };
    });

    return NextResponse.json(
        {
            state: "success",
            data: result
        },
        { status: 200 }
    );
}
