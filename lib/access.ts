import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { $Enums } from "./generated/prisma";
import { hasPermission } from "./utils";

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

    const role = sessionData.user?.role!;
    const permissions = sessionData.user?.permissions!;
    const hasAccess = hasPermission(role, resources, action, permissions);

    if (!hasAccess) {
        return NextResponse.json({
            state: "error",
            message: "Accès refusé"
        }, { status: 404 });
    }

    return sessionData.user;
}
