import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["PRODUCT_SERVICES"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    const productService = await prisma.productService.findUnique({
        where: {
            id
        },
    })

    return NextResponse.json({
        state: "success",
        data: productService,
    }, { status: 200 })
}