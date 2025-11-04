import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;
    console.log({ id });

    if (!id) {
        return NextResponse.json(
            { status: "error", message: "identifiant invalide." },
            { status: 404 }
        );
    }

    // bornes pour l'année en cours
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // 1er janvier 00:00
    const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1); // 1er janv de l'année suivante

    // On fait les deux agrégations en parallèle (seulement pour l'année en cours)
    const [receiptsAgg, dibursementsAgg] = await Promise.all([
        prisma.receipt.aggregate({
            _sum: { amount: true },
            where: {
                companyId: id,
                date: {
                    gte: startOfYear,
                    lt: startOfNextYear,
                },
            },
        }),
        prisma.dibursement.aggregate({
            _sum: { amount: true },
            where: {
                companyId: id,
                date: {
                    gte: startOfYear,
                    lt: startOfNextYear,
                },
            },
        }),
    ]);

    const totalReceiptDecimal = receiptsAgg._sum?.amount ?? null;
    const totalDibursementDecimal = dibursementsAgg._sum?.amount ?? null;

    const totalReceipt = totalReceiptDecimal ? totalReceiptDecimal.toString() : "0";
    const totalDibursement = totalDibursementDecimal ? totalDibursementDecimal.toString() : "0";

    return NextResponse.json(
        {
            state: "success",
            data: {
                totalReceipt,
                totalDibursement,
                period: {
                    start: startOfYear.toISOString(),
                    end: startOfNextYear.toISOString(),
                },
            },
        },
        { status: 200 }
    );
}
