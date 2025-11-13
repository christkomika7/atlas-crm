import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["INVOICES"], "MODIFY");
    const companyId = getIdFromUrl(req.url, 2) as string;

    if (!companyId) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide",
        }, { status: 404 });
    }

    const items = await prisma.item.findMany({
        where: {
            companyId,
            itemType: "billboard",
            state: "APPROVED"
        },
        select: {
            id: true,
            locationStart: true,
            locationEnd: true,
            billboardId: true,
            invoiceId: true
        }
    })


    const transformedItems = items.filter(item => item.locationStart && item.locationEnd).map(item => ({
        id: item.id,
        invoiceId: item.invoiceId,
        isNew: false,
        billboardReference: item.billboardId,
        locationDate: [item.locationStart, item.locationEnd]
    }))

    return NextResponse.json({
        state: "success",
        data: transformedItems,
    }, { status: 200 })
}