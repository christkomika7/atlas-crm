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
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const data = await req.json();

    if (data.ids.length === 0) {
        return NextResponse.json({ state: "error", message: "Aucun identifiant trouvé" }, { status: 404 });

    }
    const ids = data.ids as string[];

    const suppliers = await prisma.supplier.findMany({
        where: { id: { in: ids } },
        include: {
            company: true,
            dibursements: true,
            contracts: true
        }
    })

    const companyId = getFirstValidCompanyId(suppliers);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });


    const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.SUPPLIERS, ids, companyId)

    if (hasAccessDeletion) {
        return NextResponse.json({
            state: "success",
            message: "Suppression en attente de validation.",
        }, { status: 200 })
    }

    for (const supplier of suppliers) {
        if (
            supplier.dibursements.length > 0 ||
            supplier.contracts.length > 0
        ) {
            return NextResponse.json({
                state: "error",
                message: "Supprimez d'abord les transactions, bon de commandes et contrats associés à ce fournisseur.",
            }, { status: 409 });
        }

    }

    await prisma.supplier.deleteMany({
        where: {
            id: { in: ids }
        },
    })

    for (const supplier of suppliers) {
        await removePath(supplier.uploadDocuments)
    }

    return NextResponse.json({
        state: "success",
        message: "Tous les fournisseurs sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}