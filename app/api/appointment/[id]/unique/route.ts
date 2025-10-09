import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["APPOINTMENT"], "READ");
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