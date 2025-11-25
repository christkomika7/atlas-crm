import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
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
            { status: "error", message: "identifiant invalide." },
            { status: 404 }
        );
    }


    const grouped = await prisma.dibursement.groupBy({
        by: ["natureId"],
        where: {
            companyId: id,
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
