import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { getIdFromUrl } from "@/lib/utils";
import { checkAccess } from "@/lib/access";
import { createFile, removePath } from "@/lib/file";

/**
 * PUT - Téléversement, mise à jour ou suppression du règlement intérieur.
 * - Si un fichier est fourni, il est téléversé et le précédent est supprimé.
 * - Si aucun fichier n’est fourni, le champ `internalRegulations` est vidé et le fichier supprimé.
 */
export async function PUT(req: NextRequest) {
    await checkAccess(["DASHBOARD"], "MODIFY");
    const userId = getIdFromUrl(req.url, 2) as string;
    const formData = await req.formData();

    // Récupération de l'utilisateur avec son profil
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

    const uploaded = formData.get("other");
    const previousPath = user.profile?.internalRegulations;

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
                            data: { internalRegulations: "" },
                        },
                    },
                },
                include: { profile: true },
            });

            return NextResponse.json(
                {
                    message: "Le règlement intérieur a été supprimé avec succès.",
                    state: "success",
                    data: updatedUser,
                },
                { status: 200 }
            );
        } catch (error) {
            return NextResponse.json(
                {
                    message: "Erreur lors de la suppression du règlement intérieur.",
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

    const publicPath = await createFile(uploaded as File, folderName, "reglement_interieur");

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
                        data: { internalRegulations: publicPath },
                    },
                },
            },
            include: { profile: true },
        });

        return NextResponse.json(
            {
                message: "Le règlement intérieur a été mis à jour avec succès.",
                state: "success",
                data: updatedUser,
            },
            { status: 200 }
        );
    } catch (error) {
        await removePath(publicPath);
        return NextResponse.json(
            {
                message: "Une erreur s’est produite lors de l'enregistrement du règlement intérieur.",
                state: "error",
                error,
            },
            { status: 500 }
        );
    }
}
