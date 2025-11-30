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
        }, { status: 403 });
    }

    const companyId = getIdFromUrl(req.url, 2) as string;

    const filter = req.nextUrl.searchParams.get("filter")?.trim() ?? "";

    if (filter === "stop") {
        const projects = await prisma.project.findMany({
            where: {
                companyId,
                status: 'DONE'
            },
            include: { company: true, client: true }
        });

        return NextResponse.json(
            {
                state: "success",
                data: projects,
            },
            { status: 200 }
        );
    }

    if (filter === "loading") {
        const projects = await prisma.project.findMany({
            where: {
                companyId, status: {
                    not: 'DONE'
                }
            },
            include: { company: true, client: true }
        });

        return NextResponse.json(
            {
                state: "success",
                data: projects,
            },
            { status: 200 }
        );
    }

    const projects = await prisma.project.findMany({
        where: {
            companyId
        },
        include: { company: true, client: true }
    });

    return NextResponse.json(
        {
            state: "success",
            data: projects,
        },
        { status: 200 }
    );
}