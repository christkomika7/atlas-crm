import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["QUOTES"], "MODIFY");
    const companyId = getIdFromUrl(req.url, 2) as string;

    if (!companyId) {
        return NextResponse.json({
            status: "error",
            message: "Identifiant invalide",
        }, { status: 404 });
    }

    const quotes = await prisma.invoice.findMany({
        where: { companyId },
        select: {
            items: {
                where: { itemType: "billboard", state: "APPROVED" },
                select: {
                    id: true,
                    locationStart: true,
                    locationEnd: true,
                    billboardId: true
                }
            }
        }
    });

    console.log({ quotes })

    const transformedItems = quotes.flatMap(quote =>
        quote.items
            .filter(item => item.locationStart && item.locationEnd)
            .map(item => ({
                id: item.id,
                isNew: false,
                billboardReference: item.billboardId,
                locationDate: [item.locationStart, item.locationEnd]
            }))
    );

    return NextResponse.json({
        state: "success",
        data: transformedItems,
    }, { status: 200 })
}