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

    const cities = await prisma.city.findMany({
        where: {
            companyId: id
        },
        include: {
            areas: true
        }
    });

    return NextResponse.json({
        state: "success",
        data: cities,
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

    const deletedCity = await prisma.city.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedCity,
    }, { status: 200 })
}
