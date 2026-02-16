import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }

    const natures = await prisma.transactionNature.findMany({
        where: {
            categoryId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: natures,
    }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide.",
        }, { status: 404 });
    }

    const nature = await prisma.transactionNature.findUnique({
        where: { id },
        include: {
            receipts: true,
            dibursements: true,
            userActions: true
        }
    });

    if (nature?.receipts && nature.receipts.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Impossible de supprimer cette nature car des encaissements sont liés à cette nature.",
        }, { status: 409 });
    }

    if (nature?.dibursements && nature.dibursements.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Impossible de supprimer cette nature car des décaissements sont liés à cette nature.",
        }, { status: 409 });

    }

    if (nature?.userActions && nature.userActions.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Impossible de supprimer cette nature car des client | fournisseurs | tiers sont liés à cette nature.",
        }, { status: 409 });

    }


    await prisma.transactionNature.findUnique({
        where: { id },
    });

    const deletedNature = await prisma.transactionNature.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedNature,
    }, { status: 200 })
}
