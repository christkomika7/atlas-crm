import { NextRequest, NextResponse } from "next/server";
import { checkAccess } from "@/lib/access";
import { generateReportWordAndPDF } from "@/lib/word";

export async function POST(req: NextRequest) {
    const result = await checkAccess(["SETTING"], "READ");

    if (!result.authorized) {
        return NextResponse.json(
            { state: "error", message: result.message },
            { status: 403 }
        );
    }

    try {
        const { datas, report } = await req.json();

        if (!datas || !report) {
            return NextResponse.json(
                { state: "error", message: "Données ou type de rapport manquant." },
                { status: 400 }
            );
        }

        const { pdfBuffer } = await generateReportWordAndPDF(datas, report);

        const arrayBuffer = Uint8Array.from(pdfBuffer).buffer;

        const filename = `${crypto.randomUUID()}-${report}.pdf`;

        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
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
