import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "READ");
    const id = getIdFromUrl(req.url, "last") as string;

    const items = await prisma.item.findMany({
        where: {
            billboardId: id,
            state: "APPROVED"
        },
        include: {
            billboard: {
                include: {
                    client: true
                }
            },
            invoice: true,
        }
    });

    return NextResponse.json(
        {
            state: "success",
            data: items,
        },
        { status: 200 }
    );
}