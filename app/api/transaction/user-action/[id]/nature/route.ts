import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 3) as string;

    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }
    const userActions = await prisma.userAction.findMany({
        where: {
            natureId: id
        },
    });

    return NextResponse.json({
        state: "success",
        data: userActions,
    }, { status: 200 })
}

