import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("PROJECTS", ["CREATE", "MODIFY"]);

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

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