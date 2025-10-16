import prisma from "@/lib/prisma";
import { removePath } from "@/lib/file";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";

export async function DELETE(req: NextRequest) {
    await checkAccess(["CLIENTS"], "MODIFY");
    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const clients = await prisma.client.findMany({
        where: { id: { in: ids } }
    })

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