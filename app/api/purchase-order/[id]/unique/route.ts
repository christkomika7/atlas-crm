import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("PURCHASE_ORDER", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }
    const id = getIdFromUrl(req.url, 2) as string;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
            company: {
                include: {
                    documentModel: true
                }
            },
            supplier: true,
            project: true,
            items: true,
        }
    });

    return NextResponse.json({
        state: "success",
        data: purchaseOrder,
    }, { status: 200 })
}