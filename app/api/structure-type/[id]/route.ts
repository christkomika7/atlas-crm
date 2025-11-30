import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", ["CREATE", "MODIFY"]);

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

    const datas = await prisma.structureType.findMany({
        where: {
            companyId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: datas,
    }, { status: 200 })
}

export async function DELETE(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", ["CREATE", "MODIFY"]);

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

    const data = await prisma.structureType.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: data,
    }, { status: 200 })
}
