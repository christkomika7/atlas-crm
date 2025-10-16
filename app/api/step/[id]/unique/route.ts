import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["PROJECTS"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    const taskSteps = await prisma.taskStep.findUnique({
        where: {
            id
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: taskSteps,
        },
        { status: 200 }
    );
}