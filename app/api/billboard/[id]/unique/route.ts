import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("BILLBOARDS", "MODIFY");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    const billboard = await prisma.billboard.findUnique({
        where: {
            id
        },
        include: {
            company: true,
            type: true,
            city: true,
            area: true,
            items: true,
        }
    });

    return NextResponse.json({
        state: "success",
        data: {
            ...billboard,
        },
    }, { status: 200 })
}