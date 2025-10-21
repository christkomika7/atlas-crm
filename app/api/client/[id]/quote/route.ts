import prisma from "@/lib/prisma";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";
import { checkAccess } from "@/lib/access";

export async function GET(req: NextRequest) {
    await checkAccess(["INVOICES"], "READ");
    const id = getIdFromUrl(req.url, "last") as string;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
        return NextResponse.json({
            status: "error",
            message: "Aucun élément trouvé pour cet identifiant.",
        }, { status: 404 });
    }

    const quotes = await prisma.quote.findMany({
        where: {
            clientId: id
        },
    })

    return NextResponse.json({
        state: "success",
        data: quotes,
    }, { status: 200 })
}