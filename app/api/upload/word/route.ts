import { generateContractDocument } from "@/lib/word";
import { NextRequest, NextResponse } from "next/server";


// Route API pour générer et télécharger le contrat
export async function POST(req: NextRequest) {
    try {
        const { contract } = await req.json();

        if (!contract) {
            return NextResponse.json(
                { error: "Données du contrat manquantes" },
                { status: 400 }
            );
        }

        // Générer le document
        const buffer = await generateContractDocument(contract);

        // Retourner le fichier
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="Contrat_${contract.client.companyName}_AG-LOC-001.docx"`,
            },
        });
    } catch (error) {
        console.error('Erreur lors de la génération du contrat:', error);
        return NextResponse.json(
            { error: "Erreur lors de la génération du contrat" },
            { status: 500 }
        );
    }
}

