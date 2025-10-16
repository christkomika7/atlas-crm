import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucune identifiant trouvé .",

        }, { status: 404 });
    }

    const areas = await prisma.area.findMany({
        where: {
            cityId: id
        }
    });
    return NextResponse.json({
        state: "success",
        data: areas,
    }, { status: 200 })
}


export async function DELETE(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "CREATE");
    const id = getIdFromUrl(req.url, "last") as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucune identifiant trouvé .",

        }, { status: 404 });
    }

    const deletedArea = await prisma.area.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedArea,
    }, { status: 200 })
}
