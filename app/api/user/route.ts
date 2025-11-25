import { NextResponse } from "next/server";
import { sessionAccess } from "@/lib/access";
import prisma from "@/lib/prisma";

export async function GET() {
    const { hasSession, userId } = await sessionAccess();

    if (!hasSession || !userId) {
        return Response.json({
            status: "error",
            message: "Aucune session trouvée",
            data: []
        }, { status: 200 });
    }

    const users = await prisma.user.findMany({
        where: {
            role: "USER"
        },
        include: {
            profiles: true
        }
    });

    return NextResponse.json({
        state: "success",
        data: users,
        message: "",
    }, { status: 200 })
}
