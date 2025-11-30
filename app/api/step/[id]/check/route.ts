import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    const result = await checkAccess("PROJECTS", ["MODIFY"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 2) as string;
    const check = await req.json();


    const stepExist = await prisma.taskStep.findUnique({
        where: { id }
    });
    if (!stepExist) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }
    try {

        const updatedTaskStep = await prisma.taskStep.update({
            where: { id },
            data: {
                check: check,
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