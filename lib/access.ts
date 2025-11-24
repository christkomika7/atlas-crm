import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { $Enums } from "./generated/prisma";
import { hasPermission } from "./utils";
import prisma from "./prisma";

export async function checkAccess(
    resources: $Enums.Resource[],
    action: $Enums.Action,
    onlySession = false
) {
    const sessionData = await getSession();

    if (!sessionData) {
        return NextResponse.json({
            state: "error",
            message: "Accès refusé"
        }, { status: 404 });
    }

    if (onlySession) {
        return null;
    }

    if (sessionData.user.role === "ADMIN") {
        const profile = await prisma.profile.findFirst({
            where: {
                userId: sessionData.user.id
            },
            include: {
                permissions: true
            }
        })

        const role = sessionData.user?.role!;
        const permissions = profile?.permissions!;
        const hasAccess = hasPermission(role, resources, action, permissions);

        if (!hasAccess) {
            return NextResponse.json({
                state: "error",
                message: "Accès refusé"
            }, { status: 404 });
        }

        return sessionData.user;
    }

    const profile = await prisma.profile.findFirst({
        where: {
            companyId: sessionData.user.currentCompany,
            userId: sessionData.user.id
        },
        include: {
            permissions: true
        }
    })

    const role = sessionData.user?.role!;
    const permissions = profile?.permissions!;
    const hasAccess = hasPermission(role, resources, action, permissions);

    if (!hasAccess) {
        return NextResponse.json({
            state: "error",
            message: "Accès refusé"
        }, { status: 404 });
    }

    return sessionData.user;
}
