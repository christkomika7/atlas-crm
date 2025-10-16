import { checkAccess } from "@/lib/access";
import { parseData } from "@/lib/parse";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { editTaskStepSchema, EditTaskStepSchemaType } from "@/lib/zod/task-step.schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["PROJECTS"], "READ");
    const id = getIdFromUrl(req.url, "last") as string;

    const taskSteps = await prisma.taskStep.findMany({
        where: {
            taskId: id,
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


export async function PUT(req: NextRequest) {
    await checkAccess(["PROJECTS"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    const data = await req.json();
    const parsedData = (parseData<EditTaskStepSchemaType>(editTaskStepSchema,
        { ...data })) as EditTaskStepSchemaType;

    const stepExist = await prisma.taskStep.findUnique({
        where: { id }
    });
    if (!stepExist) {
        console.log({ error: "Identifiant invalide." })
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    try {

        const updatedTaskStep = await prisma.taskStep.update({
            where: { id: parsedData.id },
            data: {
                stepName: parsedData.stepName,
                check: parsedData.check,
                task: {
                    connect: {
                        id: parsedData.taskId
                    }
                }
            },
        })

        return NextResponse.json({
            status: "success",
            message: "Étape modifiée avec succès.",
            data: updatedTaskStep,
        });

    } catch (error) {
        console.log({ error })

        return NextResponse.json({
            status: "error",
            message: "Erreur lors de la modification de l'étape.",
        }, { status: 500 });
    }

}


export async function DELETE(req: NextRequest) {
    await checkAccess(["PROJECTS"], "MODIFY");
    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucun identifiant trouvé.",
        }, { status: 404 });
    }

    const taskSteps = await prisma.taskStep.delete({
        where: {
            id
        },
    });

    return NextResponse.json(
        {
            state: "success",
            data: taskSteps,
        },
        { status: 200 }
    );
}