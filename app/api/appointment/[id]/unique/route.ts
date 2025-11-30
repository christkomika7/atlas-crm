import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("APPOINTMENT", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }
    const id = getIdFromUrl(req.url, 2) as string;

    const appointment = await prisma.appointment.findUnique({
        where: {
            id
        },
    })

    return NextResponse.json({
        state: "success",
        data: appointment,
    }, { status: 200 })
}