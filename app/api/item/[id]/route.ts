import { sessionAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

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

    const items = await prisma.item.findMany({
        where: {
            billboardId: id,
            state: "APPROVED"
        },
        include: {
            billboard: {
                include: {
                    client: true
                }
            },
            invoice: true,
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: items,
        },
        { status: 200 }
    );
}