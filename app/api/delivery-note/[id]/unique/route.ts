import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const result = await checkAccess("DELIVERY_NOTES", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }


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