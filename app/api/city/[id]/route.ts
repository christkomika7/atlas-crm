import { sessionAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
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

    const city = await prisma.city.findUnique({
        where: { id },
        include: {
            areas: true
        }
    });

    if (city && city.areas.length > 0) {
        return NextResponse.json({
            state: "error",
            message: "Supprimez d'abord tous les quartiers reliés à cette ville.",
        }, { status: 409 });
    }

    const deletedCity = await prisma.city.delete({ where: { id } });
    return NextResponse.json({
        state: "success",
        data: deletedCity,
    }, { status: 200 })
}
