import { checkAccess } from "@/lib/access";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";

export async function GET(req: NextRequest) {
    const result = await checkAccess("DELIVERY_NOTES", "READ");

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
            message: "Aucun bon de livraison trouvé.",
        }, { status: 404 });
    }

    const filterParam = req.nextUrl.searchParams.get("filter") ?? undefined;
    const searchParam = req.nextUrl.searchParams.get("search") as string;

    const MAX_TAKE = 200;

    const rawSkip = req.nextUrl.searchParams.get("skip");
    const rawTake = req.nextUrl.searchParams.get("take");

    const skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;

    let take = DEFAULT_PAGE_SIZE as number;
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
            const deliveryNoteNumberSearch = parseInt(searchParam, 10);

            where.OR = [
                ...(Number.isFinite(deliveryNoteNumberSearch)
                    ? [{
                        deliveryNoteNumber: deliveryNoteNumberSearch
                    }]
                    : []
                ),
                ...searchTerms.flatMap((term: string) => [
                    { client: { companyName: { contains: term, mode: "insensitive" } } },
                    { client: { firstname: { contains: term, mode: "insensitive" } } },
                    { client: { lastname: { contains: term, mode: "insensitive" } } },
                    { project: { name: { contains: term, mode: "insensitive" } } },
                ])
            ];
        }

        if (filterParam === "complete") {
            where.isCompleted = true;
        }

        if (filterParam === "progress") {
            where.isCompleted = false;
        }

        const [total, deliveryNotes] = await prisma.$transaction([
            prisma.deliveryNote.count({ where }),
            prisma.deliveryNote.findMany({
                where,
                include: {
                    client: true,
                    items: {
                        where: { state: "IGNORE" }
                    },
                    company: {
                        include: { documentModel: true }
                    }
                },
                skip,
                take,
                orderBy: { deliveryNoteNumber: "desc" }
            })
        ]);

        return NextResponse.json(
            {
                state: "success",
                data: deliveryNotes,
                total
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erreur GET /api/delivery-notes:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de la récupération des bons de livraison." },
            { status: 500 }
        );
    }
}