import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { taskStepSchema, TaskStepSchemaType } from "@/lib/zod/task-step.schema";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    await checkAccess(["PROJECTS"], "CREATE");

    const data = await req.json();
    const parsedData = (parseData<TaskStepSchemaType>(taskStepSchema,
        { ...data })) as TaskStepSchemaType;

    const taskExist = await prisma.task.findUnique({
        where: { id: parsedData.taskId }
    });
    if (!taskExist) {
        console.log({ error: "Identifiant invalide." })
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    try {

        const createdTaskStep = await prisma.taskStep.create({
            data: {
                stepName: parsedData.stepName,
                check: parsedData.check,
                task: {
                    connect: {
                        id: parsedData.taskId
                    }
                }
            }
        })

        return NextResponse.json({
            status: "success",
            message: "Étape créée avec succès.",
            data: createdTaskStep,
        });

    } catch (error) {
        console.log({ error })

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la création de l'étape.",
        }, { status: 500 });
    }

}