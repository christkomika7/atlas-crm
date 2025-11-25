import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("SUPPLIERS", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: {
            company: true
        }
    })

    return NextResponse.json({
        state: "success",
        data: supplier,
    }, { status: 200 })
}