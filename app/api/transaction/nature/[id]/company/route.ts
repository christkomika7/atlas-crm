import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { decompressString, getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("TRANSACTION", ["CREATE", "MODIFY", "READ"]);

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 3) as string;
    const filter = JSON.parse(req.nextUrl.searchParams.get("filter")?.trim() as string) as boolean;
    const category = req.nextUrl.searchParams.get("categories")?.trim() as string;



    if (!id) {
        return NextResponse.json({
            status: "error",
            message: "identifiant invalide.",
        }, { status: 404 });
    }

    if (category) {
        const categories: string[] = JSON.parse(await decompressString(category));

        const natures = await prisma.transactionNature.findMany({
            where: {
                companyId: id,
                ...(categories && categories.length > 0 && {
                    categoryId: { in: categories }
                }),
                ...(filter && {
                    OR: [
                        { receipts: { some: {} } },
                        { dibursements: { some: {} } }
                    ]
                })
            },
        });

        return NextResponse.json({
            state: "success",
            data: natures,
        }, { status: 200 });

    }

    const natures = await prisma.transactionNature.findMany({
        where: {
            companyId: id,
            ...(filter && {
                OR: [
                    { receipts: { some: {} } },
                    { dibursements: { some: {} } }
                ]
            })
        },
    });

    return NextResponse.json({
        state: "success",
        data: natures,
    }, { status: 200 });
}
