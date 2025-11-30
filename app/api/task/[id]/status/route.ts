import { $Enums } from '@/lib/generated/prisma';
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
    const result = await checkAccess(["PROJECTS"], ["MODIFY"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

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


        console.log("HELLO WORLD");

        const project = await prisma.project.findUnique({
            where: { id: updateTask.projectId },
            include: {
                tasks: true
            }
        });

        if (project) {
            const tasks = project.tasks;

            const allDone = tasks.every((t) => t.status === "DONE");
            const hasBlocked = tasks.every((t) => t.status === "BLOCKED");
            const hasInProgress = tasks.some((t) => t.status === "IN_PROGRESS");
            const allTodo = tasks.some((t) => t.status === "TODO");

            let newProjectStatus: $Enums.ProjectStatus = project.status;

            if (allDone) {
                newProjectStatus = "DONE";
            } else if (hasBlocked) {
                newProjectStatus = "BLOCKED";
            } else if (hasInProgress) {
                newProjectStatus = "IN_PROGRESS";
            } else if (allTodo) {
                newProjectStatus = "TODO";
            } else {
                newProjectStatus = "IN_PROGRESS";
            }
            if (newProjectStatus !== project.status) {
                await prisma.project.update({
                    where: { id: project.id },
                    data: { status: newProjectStatus }
                });
            }
        }

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