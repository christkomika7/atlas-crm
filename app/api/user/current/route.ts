import { NextRequest, NextResponse } from "next/server";
import { sessionAccess } from "@/lib/access";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { hasSession } = await sessionAccess();

    if (!hasSession) {
        return Response.json({
            status: "error",
            message: "Aucune session trouvée",
            data: []
        }, { status: 200 });
    }

    const userId = req.nextUrl.searchParams.get("userId");
    const companyId = req.nextUrl.searchParams.get("companyId");

    if (!userId) {
        return NextResponse.json(
            {
                state: "error",
                message: "Aucun utilisateur trouvé.",
            },
            { status: 400 }
        );
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    if (!user) {
        return NextResponse.json(
            {
                state: "error",
                message: "Utilisateur introuvable.",
            },
            { status: 404 }
        );
    }

    if (user.role !== "ADMIN" && !companyId) {
        return NextResponse.json(
            {
                state: "error",
                message: "Aucune entreprise trouvée.",
            },
            { status: 400 }
        );
    }

    const where: any = { userId };

    if (user.role !== "ADMIN") {
        where.companyId = companyId;
    }

    const profile = await prisma.profile.findFirst({
        where,
        include: {
            user: true,
        },
    });

    if (!profile) {
        return NextResponse.json(
            {
                state: "error",
                message: "Aucun profil trouvé pour cet utilisateur.",
            },
            { status: 404 }
        );
    }

    return NextResponse.json(
        {
            state: "success",
            data: profile,
            message: "",
        },
        { status: 200 }
    );
}
