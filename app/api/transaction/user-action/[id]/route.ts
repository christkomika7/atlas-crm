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
    const userActions = await prisma.userAction.findMany({
        where: {
            companyId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: userActions,
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

    const action = await prisma.userAction.findUnique({
        where: { id },
        include: {
            receipts: true,
            dibursements: true,
        }
    })

    if (action?.receipts && action.receipts.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Impossible de supprimer ce client | fournisseur | tier car des encaissements sont liés à ce client | fournisseur | tier.",
        }, { status: 409 });
    }

    if (action?.dibursements && action.dibursements.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Impossible de supprimer ce client | fournisseur | tier car des décaissements sont liés à ce client | fournisseur | tier.",
        }, { status: 409 });

    }

    const deletedUserAction = await prisma.userAction.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedUserAction,
    }, { status: 200 })
}
