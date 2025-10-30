import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["CONTRACT"], "MODIFY");
    const id = getIdFromUrl(req.url, 2) as string;

    const contract = await prisma.contract.findUnique({
        where: { id },
        include: {
            company: true,
            client: true,
            invoices: true,
            billboard: true,
            lessor: true
        }
    })

    return NextResponse.json({
        state: "success",
        data: contract,
    }, { status: 200 })
}