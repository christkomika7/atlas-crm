import { sessionAccess } from "@/lib/access";
import { generateClientContractDocument } from "@/lib/word";
import { ContractType } from "@/types/contract-types";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const { hasSession, userId } = await sessionAccess();

    if (!hasSession || !userId) {
        return Response.json({
            status: "error",
            message: "Aucune session trouvée",
            data: []
        }, { status: 200 });
    }

    try {
        const { contract }: { contract: ContractType } = await req.json();

        if (!contract) {
            return NextResponse.json(
                { error: "Données du contrat manquantes" },
                { status: 400 }
            );
        }

        // Générer le document
        const buffer = await generateClientContractDocument(contract);

        // Retourner le fichier
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="Contrat_AG-LOC-001.docx"`,
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

