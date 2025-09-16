'use server';
import path from "path";
import fs from "fs-extra";
import { existsSync } from "fs";
import mime from "mime-types";
import prisma from "./prisma";
import { removePath, saveFile } from "./file";

// @ts-ignore - on utilise la classe globale File de Node 18+
const NodeFile = globalThis.File;

export async function getFileFromPath(filePath: string): Promise<File | null> {
    try {
        // Nettoyage éventuel du chemin (en cas de préfixe erroné)
        const cleanPath = filePath.replace(/^uploads[\/\\]?/, "");

        // Point ici vers "uploads" et non "public"
        const fullPath = path.join(process.cwd(), "uploads", cleanPath);

        const buffer = await fs.readFile(fullPath);
        const uint8Array = new Uint8Array(buffer);

        const type = mime.lookup(fullPath) || "application/octet-stream";
        const name = path.basename(fullPath);

        return new File([uint8Array], name, { type });
    } catch (err) {
        console.error("Erreur lors de la lecture du fichier:", err);
        return null;
    }
}


// Fonction séparée pour gérer les fichiers après la transaction
export async function handleFileOperations(result: any, data: any, companyHasChangeName: boolean) {
    const uploadedPaths: string[] = [];

    try {
        // Traiter les fichiers des nouveaux utilisateurs
        for (const user of result.usersToAdd) {
            const folder = path.join(
                data.companyName?.trim().replace(/\s+/g, "_").toLowerCase(),
                "user",
                `${user.firstname}_${user.lastname}`?.trim().replace(/\s+/g, "_").toLowerCase()
            );

            let imagePath = "";
            let passportPath = "";
            let documentPath = "";

            // Gestion des fichiers
            if (user.image && folder) {
                imagePath = await saveFile(user.image, folder);
                uploadedPaths.push(imagePath);
            }
            if (user.passport && folder) {
                passportPath = await saveFile(user.passport, folder);
                uploadedPaths.push(passportPath);
            }
            if (user.document && folder) {
                documentPath = await saveFile(user.document, folder);
                uploadedPaths.push(documentPath);
            }

            // Mise à jour avec les chemins des fichiers
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    image: imagePath || null,
                    path: folder,
                    profile: {
                        update: {
                            passport: passportPath || null,
                            internalRegulations: documentPath || null,
                        },
                    },
                },
            });
        }

        // Traiter les fichiers des utilisateurs mis à jour
        for (const user of result.usersToUpdate) {
            const olderUserVersion = await prisma.user.findUnique({
                where: { id: user.id },
                include: { profile: true }
            });

            if (!olderUserVersion) continue;

            const usernameHasChange = (
                olderUserVersion.name.toLowerCase() !==
                `${user.firstname} ${user.lastname}`.toLowerCase()
            );

            let folder = (usernameHasChange || companyHasChangeName)
                ? path.join(
                    data.companyName?.trim().replace(/\s+/g, "_").toLowerCase(),
                    "user",
                    `${user.firstname}_${user.lastname}`?.trim().replace(/\s+/g, "_").toLowerCase()
                )
                : olderUserVersion.path || "";

            let imagePath = "";
            let passportPath = "";
            let documentPath = "";

            // Gestion du déplacement des dossiers
            if (usernameHasChange || companyHasChangeName) {
                if (olderUserVersion.path && existsSync(olderUserVersion.path)) {
                    await fs.mkdir(folder, { recursive: true });
                    const files = await fs.readdir(olderUserVersion.path);
                    for (const file of files) {
                        await fs.rename(
                            path.join(olderUserVersion.path, file),
                            path.join(folder, file)
                        );
                    }
                    await fs.rmdir(olderUserVersion.path);
                }
            }

            // Gestion des fichiers
            if (user.image && folder) {
                if (olderUserVersion.image) {
                    await removePath(olderUserVersion.image);
                }
                imagePath = await saveFile(user.image, folder);
                uploadedPaths.push(imagePath);
            }

            if (user.passport && folder) {
                if (olderUserVersion.profile?.passport) {
                    await removePath(olderUserVersion.profile.passport);
                }
                passportPath = await saveFile(user.passport, folder);
                uploadedPaths.push(passportPath);
            }

            if (user.document && folder) {
                if (olderUserVersion.profile?.internalRegulations) {
                    await removePath(olderUserVersion.profile.internalRegulations);
                }
                documentPath = await saveFile(user.document, folder);
                uploadedPaths.push(documentPath);
            }

            // Mise à jour avec les nouveaux chemins
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    image: imagePath || olderUserVersion.image,
                    path: folder,
                    profile: {
                        update: {
                            passport: passportPath || olderUserVersion.profile?.passport,
                            internalRegulations: documentPath || olderUserVersion.profile?.internalRegulations,
                        },
                    },
                },
            });
        }

        // Nettoyer les fichiers des utilisateurs supprimés
        // (cette partie peut être faite de manière asynchrone)

    } catch (error) {
        // Nettoyage en cas d'erreur
        for (const path of uploadedPaths) {
            await removePath(path).catch(console.error);
        }
        throw error;
    }
}

