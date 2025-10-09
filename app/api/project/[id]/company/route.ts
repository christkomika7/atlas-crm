import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["PROJECTS"], "READ");
    const companyId = getIdFromUrl(req.url, 2) as string;

    const projects = await prisma.project.findMany({
        where: { companyId },
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