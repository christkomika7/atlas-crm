import prisma from "@/lib/prisma";
import { createFile, removePath } from "@/lib/file";
import { NextResponse, type NextRequest } from "next/server";
import { getIdFromUrl } from "@/lib/utils";
import { checkAccess } from "@/lib/access";


export async function PUT(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "MODIFY");
    const userId = getIdFromUrl(req.url, 2) as string;
    const formData = await req.formData();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
    });

    if (!user) {
        return NextResponse.json(
            { message: "Employé introuvable.", state: "error" },
            { status: 400 }
        );
    }

    const uploaded = formData.get("profil") as File | string;

    if (!uploaded || uploaded === "undefined") {
        await removePath(user.image);
        const data = await prisma.user.update({
            where: { id: userId },
            data: { image: "" },
        });

        return NextResponse.json(
            { message: "La photo a été supprimée avec succès.", state: "success", data },
            { status: 200 }
        );
    }

    // Supprime l’ancienne image s’il y en a une
    if (user.image) {
        await removePath(user.image);
    }

    const folderName = user.path;
    if (!folderName) {
        return NextResponse.json(
            {
                message: "Le chemin de stockage n'est pas défini pour cet utilisateur.",
                state: "error",
            },
            { status: 400 }
        );
    }

    const publicPath = await createFile(uploaded as File, folderName, "profile");

    try {
        // Mise à jour BDD
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                image: publicPath,
            },
            include: {
                profile: true
            }
        });

        return NextResponse.json(
            { message: "La photo a été modifiée avec succès.", state: "success", data: user },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Une erreur s'est produite lors de la mise à jour du profil.",
                state: "error",
                error,
            },
            { status: 500 }
        );
    }
}
