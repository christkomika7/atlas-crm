import prisma from "@/lib/prisma";
import { removePath } from "@/lib/file";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";
import { checkAccessDeletion } from "@/lib/server";
import { $Enums } from "@/lib/generated/prisma";
import { getFirstValidCompanyId } from "@/lib/utils";

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("CLIENTS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const clients = await prisma.client.findMany({
        where: { id: { in: ids } },
        include: {
            company: true,
            quotes: true,
            invoices: true,
            deliveryNotes: true,
            dibursements: true,
            receipts: true,
            appointments: true,
            projects: true,
            billboards: true,
        }
    });

    const companyId = getFirstValidCompanyId(clients);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });

    const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.CLIENTS, ids, companyId);

    if (hasAccessDeletion) {
        return NextResponse.json({
            state: "success",
            message: "Suppression en attente de validation.",
        }, { status: 200 })
    }

    for (const client of clients) {
        if (client.quotes || client.invoices || client.deliveryNotes || client.dibursements ||
            client.receipts || client.appointments || client.billboards || client.projects) {
            return NextResponse.json({
                message: "Veuillez supprimer toutes les données reliées au client (devis, facture, bon de livraison etc.).",
                state: "error",
            }, { status: 400 });
        }
    }

    await prisma.client.deleteMany({
        where: {
            id: { in: ids }
        },
    })


    clients.map(async client => {
        await removePath(client.uploadDocuments)
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les clients sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}