import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["INVOICES"], "READ");
    const companyId = getIdFromUrl(req.url, 2) as string;

    const invoices = await prisma.purchaseOrder.findMany({
        where: { companyId },
        include: {
            company: true
        },
        take: 5
    });

    return NextResponse.json({
        state: "success",
        data: invoices,
    }, { status: 200 })
}