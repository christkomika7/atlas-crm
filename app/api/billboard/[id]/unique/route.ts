import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["BILLBOARDS"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    const billboard = await prisma.billboard.findUnique({
        where: {
            id
        },
        include: {
            company: true,
            type: true,
            city: true,
            area: true,
            items: true,
        }
    });

    return NextResponse.json({
        state: "success",
        data: {
            ...billboard,
            contractDuration: [billboard?.contractStart, billboard?.contractEnd],
        },
    }, { status: 200 })
}