import { checkAccess } from "@/lib/access";
import { NextResponse, type NextRequest } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const result = await checkAccess("DASHBOARD", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }
    const companyId = req.nextUrl.searchParams.get("companyId") as string;

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