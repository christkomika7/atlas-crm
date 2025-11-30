import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
    const result = await checkAccess("CLIENTS", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }
    const id = getIdFromUrl(req.url, 2) as string;


    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
        where: {
            clientId: id
        },
        include: {
            company: {
                include: {
                    documentModel: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return NextResponse.json({
        state: "success",
        data: invoices,
    }, { status: 200 })
}