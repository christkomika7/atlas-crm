import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["PURCHASE_ORDER"], "READ");
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