import { DELIVERY_NOTE_PREFIX } from "@/config/constant";
import { checkAccess, sessionAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { generateAmaId, getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const result = await checkAccess("DELIVERY_NOTES", "MODIFY");
    const { userId } = await sessionAccess();

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const id = getIdFromUrl(req.url, 2) as string;


    const [deliveryNote, user] = await prisma.$transaction([
        prisma.deliveryNote.findUnique({
            where: { id },
        }),
        prisma.user.findUnique({ where: { id: userId as string } })
    ]);

    if (!deliveryNote) return NextResponse.json({
        state: "error",
        message: "Aucun bon de livraison trouvé."
    }, { status: 400 });

    if (!user) return NextResponse.json({
        state: "error",
        message: "Utlisateur non trouvé."
    }, { status: 400 });

    try {

        const createdDeliveryNote = await prisma.deliveryNote.update({
            where: { id: id },
            data: {
                isCompleted: true
            },
            include: {
                company: { include: { documentModel: true } }
            }
        });

        await prisma.notification.create({
            data: {
                type: 'ALERT',
                for: 'DELIVERY_NOTE',
                message: `${user.name} a validé le bon de livraison n˚ ${createdDeliveryNote.company.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(createdDeliveryNote.deliveryNoteNumber, false)}.`,
                deliveryNote: {
                    connect: { id: createdDeliveryNote.id }
                },
                company: {
                    connect: { id: createdDeliveryNote.companyId }
                }
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