
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["TRANSACTION"], "READ");
    const companyId = getIdFromUrl(req.url, "last") as string;

    const transaction = await prisma.transaction.findFirst({
        where: { companyId },
        orderBy: {
            reference: 'desc',
        },
        select: {
            reference: true
        }
    });

    return NextResponse.json({
        state: "success",
        data: transaction ? transaction.reference + 1 : 1,
    }, { status: 200 })
}