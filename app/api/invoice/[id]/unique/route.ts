import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["INVOICES"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            company: true,
            client: true,
            project: true,
            items: true,
        }
    });

    return NextResponse.json({
        state: "success",
        data: invoice,
    }, { status: 200 })
}