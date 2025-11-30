import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("DELIVERY_NOTES", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const id = getIdFromUrl(req.url, 2) as string;

    const deliveryNote = await prisma.deliveryNote.findUnique({
        where: { id },
    });

    if (!deliveryNote) return NextResponse.json({
        state: "error",
        message: "Aucun bon de livraison trouvé."
    }, { status: 400 })

    try {

        await prisma.deliveryNote.update({
            where: { id: id },
            data: {
                isCompleted: true
            }
        });

        return NextResponse.json({
            state: "success",
            message: "Le bon de livraison a été finalisé avec succès..",
            data: null,
        }, { status: 200 })

    } catch (error) {
        console.error(error)
        return NextResponse.json({
            state: "error",
            message: "Erreur lors de finalisation du bon de livraison."
        }, { status: 400 })

    }


}