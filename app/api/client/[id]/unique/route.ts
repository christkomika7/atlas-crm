import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("CLIENTS", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            company: true
        }
    })

    return NextResponse.json({
        state: "success",
        data: client,
    }, { status: 200 })
}