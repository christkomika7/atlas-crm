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
        const formData = await req.formData();

        const file = formData.get('profil') as File;
        const folder = formData.get('path') as string;

        if (!file || !folder) {
            return NextResponse.json(
                { message: 'Fichier ou chemin manquant.' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const folderName = folder.trim().replace(/\s+/g, '_').toLowerCase();
        const uploadDir = path.join(process.cwd(), 'uploads', folderName);

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const ext = path.extname(file.name); // ex: ".jpg", ".png"
        const uniqueName = `${crypto.randomUUID()}${ext}`;
        const filePath = path.join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

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
