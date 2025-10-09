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

    const uploaded = formData.get("passport");

    const previousPath = user.profile?.passport;

    // CAS 1 : PAS DE FICHIER → SUPPRESSION
    if (!uploaded || uploaded === "undefined" || uploaded === "") {
        await removePath(previousPath);

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    profile: {
                        update: {
                            where: { userId },
                            data: { passport: "" },
                        },
                    },
                },
                include: { profile: true },
            });

            return NextResponse.json(
                {
                    message: "Le passeport a été supprimé avec succès.",
                    state: "success",
                    data: updatedUser,
                },
                { status: 200 }
            );
        } catch (error) {
            return NextResponse.json(
                {
                    message: "Erreur lors de la suppression du passeport.",
                    state: "error",
                    error,
                },
                { status: 500 }
            );
        }
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

    const publicPath = await createFile(uploaded as File, folderName, "passport");

    try {
        if (previousPath) {
            await removePath(previousPath);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                profile: {
                    update: {
                        where: { userId },
                        data: {
                            passport: publicPath,
                        },
                    },
                },
            },
            include: { profile: true },
        });

        return NextResponse.json(
            {
                message: "Le passeport a été mis à jour avec succès.",
                state: "success",
                data: updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        // Nettoyage si erreur
        await removePath(publicPath);
        return NextResponse.json(
            {
                message: "Erreur lors de l'enregistrement du passeport.",
                state: "error",
                error,
            },
            { status: 500 }
        );
    }
}
