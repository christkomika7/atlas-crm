import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";
import { checkAccessDeletion } from "@/lib/server";
import { $Enums } from "@/lib/generated/prisma";
import { getFirstValidCompanyId } from "@/lib/utils";

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("CONTRACT", "MODIFY");

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

    const contracts = await prisma.contract.findMany({
        where: { id: { in: ids } },
        include: {
            company: true,
        }
    });

    const companyId = getFirstValidCompanyId(contracts);

    if (!companyId) return NextResponse.json({
        message: "Identifiant invalide.",
        state: "error",
    }, { status: 400 });

    const hasAccessDeletion = await checkAccessDeletion($Enums.DeletionType.CONTRACT, ids, companyId);

    if (hasAccessDeletion) {
        return NextResponse.json({
            state: "success",
            message: "Suppression en attente de validation.",
        }, { status: 200 })
    }

    await prisma.contract.deleteMany({
        where: {
            id: { in: ids }
        },
    })

    return NextResponse.json({
        state: "success",
        message: "Tous les contrats sélectionnés ont été supprimés avec succès.",
    }, { status: 200 })

}