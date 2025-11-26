import { type NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/access";

import prisma from "@/lib/prisma";

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
            { status: "error", message: "identifiant invalide." },
            { status: 404 }
        );
    }

    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);

    // On fait les deux agrégations en parallèle (seulement pour l'année en cours)
    const [receiptsAgg, dibursementsAgg] = await Promise.all([
        prisma.receipt.aggregate({
            _sum: { amount: true },
            where: {
                companyId,
                date: {
                    gte: startOfYear,
                    lt: startOfNextYear,
                },
            },
        }),
        prisma.dibursement.aggregate({
            _sum: { amount: true },
            where: {
                companyId,
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
