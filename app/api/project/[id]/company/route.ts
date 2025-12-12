import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("PROJECTS", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucun projet trouvé.",
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

            where.OR = searchTerms.flatMap((term: string) => [
                { name: { contains: term, mode: "insensitive" } },
                { projectInformation: { contains: term, mode: "insensitive" } },
            ]);
        }

        if (filterParam === "stop") {
            where.status = "DONE";
        }

        if (filterParam === "loading") {
            where.status = { not: "DONE" };
        }

        const [total, projects] = await prisma.$transaction([
            prisma.project.count({ where }),
            prisma.project.findMany({
                where,
                include: {
                    company: true,
                    client: true
                },
                skip,
                take,
                orderBy: { createdAt: "desc" }
            })
        ]);

        return NextResponse.json(
            {
                state: "success",
                data: projects,
                total
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erreur GET /api/projects:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de la récupération des projets." },
            { status: 500 }
        );
    }
}