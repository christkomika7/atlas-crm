import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
    await checkAccess(["INVOICES"], "READ");
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
        }
    })

    return NextResponse.json({
        state: "success",
        data: purchaseOrders,
    }, { status: 200 })
}