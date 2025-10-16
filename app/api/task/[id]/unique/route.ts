import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["PROJECTS"], "READ");
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