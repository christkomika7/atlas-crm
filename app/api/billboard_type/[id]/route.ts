import { checkAccess, sessionAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "READ");

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
            message: "Aucune identifiant trouvé .",

        }, { status: 404 });
    }

    const billboardTypes = await prisma.billboardType.findMany({
        where: {
            companyId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: billboardTypes,
    }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
    const { hasSession, userId } = await sessionAccess();

    if (!hasSession || !userId) {
        return Response.json({
            status: "error",
            message: "Aucune session trouvée",
            data: []
        }, { status: 200 });
    }
    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucune identifiant trouvé .",

        }, { status: 404 });
    }

    const deletedBillboardType = await prisma.billboardType.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedBillboardType,
    }, { status: 200 })
}
