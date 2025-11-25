import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess(["PROJECTS"], ["CREATE", "MODIFY"]);

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    const task = await prisma.task.findUnique({
        where: {
            id
        },
        include: {
            users: true,
            steps: true,
            project: {
                include: {
                    company: true,
                    collaborators: true
                }
            }
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: task,
        },
        { status: 200 }
    );
}