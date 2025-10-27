import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const recordId = req.nextUrl.searchParams.get("recordId") ?? "";
    const recordName = req.nextUrl.searchParams.get("recordName") ?? "";

    const where: any = {};

    if (recordName === "invoice" && recordId) {
        where.invoiceId = recordId;
    } else if (recordName === "purchase-order" && recordId) {
        where.purchaseOrderId = recordId;
    }

    try {
        const payments = await prisma.payment.findMany({
            where,
            orderBy: { createdAt: "asc" },
        });

        console.log({ payments })

        return NextResponse.json(
            {
                state: "success",
                data: payments,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                state: "error",
                message: "Erreur lors de la récupération des paiements.",
            },
            { status: 500 }
        );
    }
}
