import { checkAccess } from "@/lib/access";
import { type NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import Decimal from "decimal.js";

export async function GET(req: NextRequest) {
    const result = await checkAccess("DASHBOARD", "CREATE");

    if (!result.authorized) {
        return Response.json({
            status: "error",
            message: result.message,
            data: []
        }, { status: 200 });
    }

    const companyId = req.nextUrl.searchParams.get("companyId") as string;

    const [receipts, dibursements] = await prisma.$transaction([
        prisma.receipt.findMany({
            where: { companyId },
            include: {
                source: true
            }
        }),
        prisma.dibursement.findMany({
            where: { companyId },
            include: {
                source: true
            }
        }),
    ]);

    const allTransactions = [
        ...receipts.map(r => ({ ...r, transactionType: 'RECEIPT' as const })),
        ...dibursements.map(d => ({ ...d, transactionType: 'DISBURSEMENT' as const }))
    ];

    const groupedBySource = allTransactions.reduce((acc, transaction) => {
        const sourceName = transaction.source?.name || 'Sans source';

        if (!acc[sourceName]) {
            acc[sourceName] = {
                sourceName,
                sourceId: transaction.source?.id || null,
                sourceType: transaction.source?.sourceType || null,
                totalReceipts: new Decimal(0),
                totalDisbursements: new Decimal(0),
            };
        }

        if (transaction.transactionType === 'RECEIPT') {
            acc[sourceName].totalReceipts = acc[sourceName].totalReceipts.plus(new Decimal(transaction.amount.toString()));
        } else {
            acc[sourceName].totalDisbursements = acc[sourceName].totalDisbursements.plus(new Decimal(transaction.amount.toString()));
        }

        return acc;
    }, {} as Record<string, any>);

    const transactions = Object.values(groupedBySource).map((source: any) => {
        const totalReceipts = source.totalReceipts as Decimal;
        const totalDisbursements = source.totalDisbursements as Decimal;

        const difference = totalReceipts.minus(totalDisbursements);

        const total = totalReceipts.plus(totalDisbursements);

        const percentageDifference = total.greaterThan(0)
            ? difference.dividedBy(total).times(100)
            : new Decimal(0);

        return {
            sourceName: source.sourceName,
            sourceId: source.sourceId,
            sourceType: source.sourceType,
            totalReceipts: totalReceipts,
            totalDisbursements: totalDisbursements,
            difference: difference,
            percentageDifference: percentageDifference.toDecimalPlaces(2).toNumber()
        };
    });

    return NextResponse.json({
        state: "success",
        data: transactions,
    }, { status: 200 })
}