import prisma from "@/lib/prisma";
import { removePath } from "@/lib/file";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";
import { checkAccessDeletion } from "@/lib/server";
import { $Enums } from "@/lib/generated/prisma";
import { getFirstValidCompanyId } from "@/lib/utils";

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("SUPPLIERS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const suppliers = await prisma.supplier.findMany({
        where: { id: { in: ids } },
        include: { company: true }
    })

    const companyId = getFirstValidCompanyId(suppliers);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });


    await checkAccessDeletion($Enums.DeletionType.SUPPLIERS, ids, companyId)

    await prisma.supplier.deleteMany({
        where: {
            id: { in: ids }
        },
    })

    suppliers.map(async supplier => {
        await removePath(supplier.uploadDocuments)
    })
    return NextResponse.json({
        state: "success",
        message: "Tous les fournisseurs sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}