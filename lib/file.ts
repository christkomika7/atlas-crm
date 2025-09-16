import path from "path";
import fs from "fs-extra";

type RemoveResult = { path: string; success: boolean };
export type OutdatedData = { id: string; path: string; files?: string[] };
export type UpdatedData = { id: string; lastUploadDocuments?: string[] }

export async function saveFile(file: File, folder: string, filename?: string): Promise<string> {
    const relativeFilePath = "";
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "uploads", folder);
        if (!fs.existsSync(uploadDir)) {
            await fs.mkdir(uploadDir, { recursive: true });
        }


        const ext = path.extname(file.name);
        const fileName = `${filename ? filename + "----" + crypto.randomUUID() : crypto.randomUUID()}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        const relativeFilePath = `${folder}/${fileName}`;

        console.log(`Fichier sauvegardé avec succès: ${relativeFilePath}`);
        return relativeFilePath;
    } catch (error) {
        await removePath(relativeFilePath);
        console.error(`Erreur lors de la sauvegarde du fichier:`, error);
        return "";
    }
}

export async function removePath(
    relativePaths?: string | Array<string | null | undefined> | null
): Promise<RemoveResult[]> {
    if (!relativePaths) {
        console.warn("removePath bloquée : aucun chemin fourni.");
        return [];
    }

    const paths = Array.isArray(relativePaths)
        ? relativePaths
        : [relativePaths];

    const uploadsRoot = path.join(process.cwd(), "uploads");
    const results: RemoveResult[] = [];

    for (const relativePath of paths) {
        if (!relativePath) {
            // Ignore null, undefined ou chaine vide
            continue;
        }

        try {
            const fullPath = path.normalize(path.join(uploadsRoot, relativePath));
            // Vérification de sécurité : ne jamais sortir du dossier "uploads"
            if (!fullPath.startsWith(uploadsRoot)) {
                console.warn("Chemin non autorisé :", fullPath);
                results.push({ path: relativePath, success: false });
                continue;
            }

            // Vérifie l'existence du chemin
            try {
                await fs.access(fullPath);
            } catch {
                console.warn("Chemin non trouvé :", fullPath);
                results.push({ path: relativePath, success: false });
                continue;
            }

            const stats = await fs.stat(fullPath);

            if (stats.isFile()) {
                await fs.unlink(fullPath);
                console.log(`Fichier supprimé : ${fullPath}`);

                // Supprimer le dossier parent si vide
                const dir = path.dirname(fullPath);
                const files = await fs.readdir(dir);
                if (files.length === 0) {
                    await fs.rmdir(dir);
                    console.log(`Dossier parent supprimé car vide : ${dir}`);
                }
                results.push({ path: relativePath, success: true });
                continue;
            }

            if (stats.isDirectory()) {
                await fs.rm(fullPath, { recursive: true, force: true });
                console.log(`Dossier supprimé : ${fullPath}`);
                results.push({ path: relativePath, success: true });
                continue;
            }

            results.push({ path: relativePath, success: false });
        } catch (err) {
            console.error("Erreur lors de la suppression :", err);
            results.push({ path: relativePath, success: false });
        }
    }

    return results;
}

export function createFolder(paths: string[]): string {
    const sanitized = paths.map(p => p.trim().replace(/\s+/g, "_").toLowerCase());
    return path.join(...sanitized);
}

export async function moveTo(oldPath: string, newPath: string): Promise<boolean> {
    const uploadsRoot = path.join(process.cwd(), "uploads");
    const fromPath = path.normalize(path.join(uploadsRoot, oldPath));
    const toPath = path.normalize(path.join(uploadsRoot, newPath));

    // Sécurité : empêcher la sortie de `uploads`
    if (!fromPath.startsWith(uploadsRoot) || !toPath.startsWith(uploadsRoot)) {
        console.warn("Chemin non autorisé.");
        return false;
    }

    try {
        // Vérifie que le dossier source existe
        await fs.access(fromPath);
        const stats = await fs.stat(fromPath);

        if (!stats.isDirectory()) {
            console.warn("Le chemin source n'est pas un dossier :", fromPath);
            return false;
        }

        // Crée le dossier cible s'il n'existe pas
        await fs.ensureDir(toPath);

        // Récupère tous les fichiers et dossiers dans le dossier source
        const items = await fs.readdir(fromPath);
        for (const item of items) {
            const src = path.join(fromPath, item);
            const dest = path.join(toPath, item);
            await fs.move(src, dest, { overwrite: true });
        }

        // Supprime le dossier source s'il est vide
        await fs.remove(fromPath);
        console.log(`Déplacement réussi de "${oldPath}" vers "${newPath}".`);
        return true;
    } catch (err) {
        console.error("Erreur lors du déplacement :", err);
        return false;
    }
}

export async function createFile(
    file: File | null | undefined,
    folder: string,
    filename?: string
): Promise<string> {
    if (!file || !folder) {
        console.warn("createFile bloquée : fichier ou dossier manquant.");
        return "";
    }
    try {
        const upload = await saveFile(file, folder, filename);
        console.log(`Fichier créé et sauvegardé dans ${upload}`);
        return upload;
    } catch (error) {
        console.error("Erreur lors de la création du fichier :", error);
        return "";
    }
}


export async function updateFiles({
    folder,
    outdatedData,
    updatedData,
    files,
}: {
    folder: string;
    outdatedData: OutdatedData;
    updatedData: UpdatedData;
    files: File[];
}): Promise<string[]> {
    const previousDocs = outdatedData.files ?? [];

    // fichiers supprimés
    const deletedDocs = previousDocs.filter(
        (doc) => !updatedData.lastUploadDocuments?.includes(doc)
    );

    // fichiers conservés
    const keptDocs = previousDocs.filter(
        (doc) => updatedData.lastUploadDocuments?.includes(doc)
    );

    console.log({ deletedDocs, keptDocs, newDocs: files, oldDocs: previousDocs });

    // supprimer les anciens fichiers retirés
    await removePath(deletedDocs);

    // déplacer le dossier si on change d’endroit
    if (updatedData.id === outdatedData.id && outdatedData.path !== folder) {
        console.log("Déplacement du dossier :", { from: outdatedData.path, to: folder });
        await moveTo(outdatedData.path, folder);
    }

    let savedPaths: string[] = [];

    // garder les anciens fichiers conservés (mais bien pointer vers le nouveau dossier)
    for (const doc of keptDocs) {
        const filename = doc.split("/").pop() as string;
        const newPath = `${folder}/${filename}`;
        console.log("keep -> ", newPath);

        // ⚠️ si on a changé de dossier, il faut copier/déplacer le fichier
        if (outdatedData.path !== folder) {
            await moveTo(doc, newPath);
        }

        savedPaths.push(newPath);
    }

    // ajouter les nouveaux fichiers
    for (const file of files) {
        const filePath = await saveFile(file, folder);
        console.log("new -> ", filePath);
        savedPaths.push(filePath);
    }

    return savedPaths;
}

