import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("PROJECTS", ["MODIFY"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
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