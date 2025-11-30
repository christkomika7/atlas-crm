import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("INVOICES", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 2) as string;

    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            company: {
                include: {
                    documentModel: true
                }
            },
            client: true,
            project: true,
            items: {
                where: {
                    state: "APPROVED"
                }
            },
        }
    });

    return NextResponse.json({
        state: "success",
        data: invoice,
    }, { status: 200 })
}