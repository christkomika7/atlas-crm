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

    const companyId = getIdFromUrl(req.url, 2) as string;

    const collaborators = await prisma.profile.findMany({
        where: {
            companyId,
        },
        include: {
            user: true
        }
    })

    return NextResponse.json({
        state: "success",
        data: collaborators,
        message: "",
    }, { status: 200 })
}