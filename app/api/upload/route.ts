import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { auth, getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const sessionData = await getSession();

    if (!sessionData) return NextResponse.json({
        state: "error",
        message: "Accès refusé"
    }, { status: 404 })


    const url = new URL(req.url);
    const imagePath = url.searchParams.get("path");

    if (!imagePath) {
        return NextResponse.json({ error: "Chemin manquant" }, { status: 400 });
    }

    const session = await getSession()
    if (!session?.user) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const fullPath = path.join(process.cwd(), "uploads", imagePath);

    try {
        const file = await fs.readFile(fullPath);
        const extension = path.extname(fullPath).slice(1);
        const contentType = `image/${extension === "jpg" ? "jpeg" : extension}`;

        return new NextResponse(new Uint8Array(file), {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "no-store",
            },
        });
    } catch {
        return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
    }
}
