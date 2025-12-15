import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/access";
import { generateTransactionsWordAndPDF } from "@/lib/word";
import prisma from "@/lib/prisma";
import { getTransactionsYearRange } from "@/lib/date";
import { TransactionType } from "@/types/transaction.type";
import { generateTransactionsExcel } from "@/lib/excel";

export async function POST(req: NextRequest) {
    const result = await checkAccess(["SETTING"], "READ");

    if (!result.authorized) {
        return NextResponse.json(
            { state: "error", message: result.message },
            { status: 403 }
        );
    }

    try {
        const { datas, companyId, doc } = await req.json();

        if (!datas || !companyId || !doc) {
            return NextResponse.json(
                { state: "error", message: "Données ou type de rapport manquant." },
                { status: 400 }
            );
        }

        const transactions = datas as TransactionType[];

        const company = await prisma.company.findUnique({ where: { id: companyId } });

        if (!company) {
            return NextResponse.json(
                { state: "error", message: "Aucune entreprise trouvée." },
                { status: 400 }
            );
        }

        const yearLabel = getTransactionsYearRange(transactions);

        const [wordBuffer, excelBuffer] = await Promise.all([
            generateTransactionsWordAndPDF(datas, company.companyName, company.currency, yearLabel),
            generateTransactionsExcel(datas, company.companyName, company.currency, yearLabel)
        ]);

        if (doc === 'excel') {
            const filename = `transactions.xlsx`;
            return new NextResponse(excelBuffer, {
                headers: {
                    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            });
        }

        return new NextResponse(wordBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                "Content-Disposition": `attachment; filename="transaction.docx"`,
            },
        });
    } catch (error: any) {
        console.error("Erreur export PDF:", error);
        return NextResponse.json(
            { state: "error", message: error.message || "Erreur lors de l'export PDF." },
            { status: 500 }
        );
    }
}
