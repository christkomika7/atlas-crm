import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
    const result = await checkAccess("SUPPLIERS", "READ");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const id = getIdFromUrl(req.url, 2) as string;


    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
        where: {
            supplierId: id
        },
        include: {
            company: {
                include: {
                    documentModel: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return NextResponse.json({
        state: "success",
        data: purchaseOrders,
    }, { status: 200 })
}