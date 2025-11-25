import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';
import { sessionAccess } from '@/lib/access';


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
        // Récupération des données du formulaire
        const formData = await req.formData();

        const file = formData.get('profil') as File;
        const folder = formData.get('path') as string;

        // Validation des champs
        if (!file || !folder) {
            return NextResponse.json(
                { message: 'Fichier ou chemin manquant.' },
                { status: 400 }
            );
        }

        // Lecture du fichier
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Création du nom du dossier
        const folderName = folder.trim().replace(/\s+/g, '_').toLowerCase();
        const uploadDir = path.join(process.cwd(), 'uploads', folderName);

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Générer un nom de fichier unique en gardant l'extension
        const ext = path.extname(file.name); // ex: ".jpg", ".png"
        const uniqueName = `${crypto.randomUUID()}${ext}`;
        const filePath = path.join(uploadDir, uniqueName);

        // Écriture sur le disque
        await writeFile(filePath, buffer);

        // Chemin public relatif
        const publicPath = `${folderName}/${uniqueName}`;

        return NextResponse.json({
            success: true,
            path: publicPath,
        });
    } catch (error) {
        console.error("Erreur upload profil :", error);
        return NextResponse.json(
            {
                message: "Erreur lors de l'envoi du fichier.",
                error,
            },
            { status: 500 }
        );
    }
}
