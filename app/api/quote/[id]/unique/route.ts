import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["QUOTES"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
            company: {
                include: {
                    documentModel: true
                }
            },
            client: true,
            project: true,
            items: {
                where: {
                    state: "IGNORE"
                },

            },
        }
    });

    return NextResponse.json({
        state: "success",
        data: quote,
    }, { status: 200 })
}