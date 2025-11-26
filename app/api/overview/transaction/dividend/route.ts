import { checkAccess } from "@/lib/access";
import { type NextRequest, NextResponse } from "next/server";

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


    const grouped = await prisma.dibursement.groupBy({
        by: ["natureId"],
        where: {
            companyId,
            category: {
                name: "Dividendes",
            },
        },
        _sum: {
            amount: true,
        },
    });

    const natureIds = grouped.map((g) => g.natureId).filter(Boolean);

    const natures = await prisma.transactionNature.findMany({
        where: { id: { in: natureIds } },
        select: { id: true, name: true },
    });

    const natureMap = new Map(natures.map((n) => [n.id, n.name]));

    const result = grouped.map((g) => {
        const totalDecimal = g._sum.amount;
        const total = totalDecimal ? totalDecimal.toString() : "0";
        return {
            natureId: g.natureId,
            name: natureMap.get(g.natureId) ?? "—",
            total,
        };
    });

    return NextResponse.json(
        { state: "success", data: result },
        { status: 200 }
    );

}
