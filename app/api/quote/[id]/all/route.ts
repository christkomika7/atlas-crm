import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("QUOTES", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucun devis trouvé.",
        }, { status: 404 });
    }

    // read params from query string
    const dataParam = req.nextUrl.searchParams.get("type") ?? undefined;
    const searchParam = req.nextUrl.searchParams.get("search") as string;

    // pagination
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

            const invoiceNumberSearch = parseInt(searchParam, 10);

            where.OR = [
                ...(Number.isFinite(invoiceNumberSearch)
                    ? [{
                        invoiceNumber: invoiceNumberSearch
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

        if (dataParam === "complete") {
            where.isCompleted = true
        }

        if (dataParam === "progress") {
            where.isCompleted = true
        }

        const [total, quotes] = await prisma.$transaction([
            prisma.quote.count({ where }),
            prisma.quote.findMany({
                where,
                include: {
                    client: true,
                    project: true,
                    items: {
                        where: { state: "IGNORE" }
                    },
                    company: {
                        include: { documentModel: true }
                    }
                },
                skip,
                take,
                orderBy: { quoteNumber: "desc" }
            })
        ]);


        return NextResponse.json(
            {
                state: "success",
                data: quotes,
                total
            },
            { status: 200 }
        );


    } catch (error) {
        console.error("Erreur GET /api/quotes:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de la récupération des devis." },
            { status: 500 }
        );
    }




}
