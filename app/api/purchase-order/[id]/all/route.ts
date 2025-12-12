import { checkAccess } from "@/lib/access";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const result = await checkAccess("PURCHASE_ORDER", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucun bon de commande trouvé.",
        }, { status: 404 });
    }

    const filterParam = req.nextUrl.searchParams.get("filter") ?? undefined;
    const searchParam = req.nextUrl.searchParams.get("search") as string;

    const MAX_TAKE = 200;
    const DEFAULT_TAKE = 50;

    const rawSkip = req.nextUrl.searchParams.get("skip");
    const rawTake = req.nextUrl.searchParams.get("take");

    const skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;

    let take = DEFAULT_TAKE;
    if (rawTake) {
        const parsed = parseInt(rawTake, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
            take = Math.min(parsed, MAX_TAKE);
        }
    }

    try {
        let where: any = { companyId: id };

        if (searchParam) {
            const searchTerms = searchParam.split(/\s+/).filter(Boolean);
            const purchaseOrderNumberSearch = parseInt(searchParam, 10);

            where.OR = [
                ...(Number.isFinite(purchaseOrderNumberSearch)
                    ? [{
                        purchaseOrderNumber: purchaseOrderNumberSearch
                    }]
                    : []
                ),
                ...searchTerms.flatMap((term: string) => [
                    { supplier: { companyName: { contains: term, mode: "insensitive" } } },
                    { supplier: { firstname: { contains: term, mode: "insensitive" } } },
                    { supplier: { lastname: { contains: term, mode: "insensitive" } } },
                    { project: { name: { contains: term, mode: "insensitive" } } },
                ])
            ];
        }

        if (filterParam === "paid") {
            where.isPaid = true;
        }

        if (filterParam === "unpaid") {
            where.isPaid = false;
        }

        const [total, purchaseOrders] = await prisma.$transaction([
            prisma.purchaseOrder.count({ where }),
            prisma.purchaseOrder.findMany({
                where,
                include: {
                    supplier: true,
                    project: true,
                    items: true,
                    company: {
                        include: { documentModel: true }
                    }
                },
                skip,
                take,
                orderBy: { purchaseOrderNumber: "desc" }
            })
        ]);

        return NextResponse.json(
            {
                state: "success",
                data: purchaseOrders,
                total
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erreur GET /api/purchase-orders:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de la récupération des bons de commande." },
            { status: 500 }
        );
    }
}