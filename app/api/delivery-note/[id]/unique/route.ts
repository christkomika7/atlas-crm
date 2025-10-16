import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await checkAccess(["DELIVERY_NOTES"], "READ");
    const id = getIdFromUrl(req.url, 2) as string;

    const deliveryNote = await prisma.deliveryNote.findUnique({
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
        data: deliveryNote,
    }, { status: 200 })
}