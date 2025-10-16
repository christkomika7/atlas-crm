import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["SUPPLIERS"], "MODIFY");
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