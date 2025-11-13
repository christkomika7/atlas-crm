// app/api/export-word/route.ts
import { NextRequest, NextResponse } from "next/server";
import htmlToDocx from "@turbodocx/html-to-docx";

export async function POST(req: NextRequest) {
    try {
        const { html } = await req.json();

        if (!html) {
            return NextResponse.json(
                { status: "error", message: "HTML manquant" },
                { status: 400 }
            );
        }

        // Conversion HTML -> DOCX
        const docxBuffer = await htmlToDocx(html);

        let arrayBuffer: ArrayBuffer;
        if (docxBuffer instanceof ArrayBuffer) {
            arrayBuffer = docxBuffer;
        } else if (docxBuffer instanceof Blob) {
            arrayBuffer = await docxBuffer.arrayBuffer();
        } else {
            // Node.js Buffer ou ArrayBufferLike
            arrayBuffer = new Uint8Array(docxBuffer).buffer;
        }

        // Créer le Blob
        const blob = new Blob([arrayBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        return new NextResponse(blob, {
            status: 200,
            headers: {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": 'attachment; filename="export.docx"',
            },
        });
    } catch (error) {
        console.error("Erreur lors de l'export Word:", error);
        return NextResponse.json(
            { status: "error", message: "Erreur lors de l'export Word" },
            { status: 500 }
        );
    }
}