import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const id = getIdFromUrl(req.url, 2) as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "Aucune identifiant trouvé .",

        }, { status: 404 });
    }

    const areas = await prisma.area.findMany({
        where: {
            companyId: id
        }
    });
    return NextResponse.json({
        state: "success",
        data: areas,
    }, { status: 200 })
}

