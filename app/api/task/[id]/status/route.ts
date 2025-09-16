import { $Enums } from '@/lib/generated/prisma';
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
    await checkAccess(["PROJECTS"], "MODIFY");
    const id = getIdFromUrl(req.url, 2) as string;
    const status: $Enums.ProjectStatus = await req.json();

    const task = await prisma.task.findUnique({
        where: { id },
    });

    if (!task) {
        return NextResponse.json({
            message: "Tâche introuvable.",
            state: "error",
        }, { status: 400 })
    }

    try {
        const updateTask = await prisma.task.update({
            where: { id },
            data: {
                status
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
        return NextResponse.json({
            state: "success",
            data: updateTask,
            message: "",
        }, { status: 200 }
        )

    } catch (error) {
        console.log({ error })
        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la modification du status de la tâche.",
        }, { status: 500 });
    }
}