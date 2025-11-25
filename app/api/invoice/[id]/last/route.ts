import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("INVOICES", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }
    const companyId = getIdFromUrl(req.url, 2) as string;

    const invoices = await prisma.invoice.findMany({
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