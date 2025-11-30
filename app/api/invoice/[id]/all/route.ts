import { checkAccess } from "@/lib/access";
import { getIdFromUrl } from "@/lib/utils";
import { NextResponse, type NextRequest } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const result = await checkAccess("INVOICES", "READ");

    if (!result.authorized) {
        return Response.json({
            state: "error",
            message: result.message,
        }, { status: 403 });
    }

    const id = getIdFromUrl(req.url, 2) as string;
    if (!id) {
        return NextResponse.json(
            { status: "error", message: "Aucune facture trouvée." },
            { status: 404 }
        );
    }

    // read params from query string
    const dataParam = req.nextUrl.searchParams.get("type") ?? undefined;
    const clientParam = req.nextUrl.searchParams.get("client") ?? undefined;

    // pagination
    const MAX_TAKE = 200;
    const DEFAULT_TAKE = 50;

    const rawSkip = req.nextUrl.searchParams.get("skip");
    const rawTake = req.nextUrl.searchParams.get("take");

    const skip = rawSkip ? Math.max(0, parseInt(rawSkip, 10) || 0) : 0;

    let take = DEFAULT_TAKE;
    if (rawTake) {
        const parsed = parseInt(rawTake, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
            take = Math.min(parsed, MAX_TAKE);
        }
    }

    try {
        let where: any = { companyId: id };

        if (dataParam === "contract") {
            if (clientParam) {
                where.clientId = clientParam;
                where.items = { some: { itemType: "billboard" } };
            } else {
                return NextResponse.json(
                    { status: "success", data: [], total: 0 },
                    { status: 200 }
                );
            }
        } else if (dataParam === "paid" || dataParam === "unpaid") {
            where.isPaid = dataParam === "paid";
        }

        const total = await prisma.invoice.count({ where });

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                client: true,
                project: true,
                items: {
                    where: { state: "APPROVED" }
                },
                company: {
                    include: { documentModel: true }
                }
            },
            skip,
            take,
            orderBy: { invoiceNumber: "desc" }
        });

        return NextResponse.json(
            {
                status: "success",
                data: invoices,
                total,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur GET /api/invoices:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de la récupération des factures." },
            { status: 500 }
        );
    }
}
