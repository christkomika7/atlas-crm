import { openDB } from 'idb';

const DB_NAME = 'temp_user_files';
const STORE_NAME = 'files';

export type TypedFile = {
    type: 'profile' | 'passport' | 'doc';
    file: File;
};

export async function getFileDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

// Remplace tous les fichiers existants pour une clé
export async function saveFiles(key: string, files: TypedFile[]) {
    const db = await getFileDB();
    await db.put(STORE_NAME, files, key);
}

// Ajoute ou met à jour un seul fichier par type
export async function setFile(key: string, newFile: TypedFile) {
    const db = await getFileDB();
    const existing = (await db.get(STORE_NAME, key)) as TypedFile[] | undefined;

    const updated = existing
        ? existing.some(f => f.type === newFile.type)
            ? existing.map(f => (f.type === newFile.type ? newFile : f))
            : [...existing, newFile]
        : [newFile];

    await db.put(STORE_NAME, updated, key);
}

// Récupère tous les fichiers d'une clé
export async function getFiles(key: string): Promise<TypedFile[] | undefined> {
    const db = await getFileDB();
    return (await db.get(STORE_NAME, key)) as TypedFile[] | undefined;
}

// Récupère un fichier précis par son type
export async function getFileByType(
    key: string,
    type: TypedFile['type']
): Promise<File | undefined> {
    const db = await getFileDB();
    const files = (await db.get(STORE_NAME, key)) as TypedFile[] | undefined;
    const storedFile = files?.find(f => f.type === type)?.file;

    if (!storedFile) return undefined;

    // Si storedFile est Blob et pas File, créer un nouveau File
    if (storedFile instanceof File) return storedFile;

    const blob = storedFile as Blob;
    return new File([blob], "filename", { type: blob.type });
}


// Supprime un fichier spécifique par son type
export async function removeFile(key: string, type: TypedFile['type']) {
    const db = await getFileDB();
    const files = (await db.get(STORE_NAME, key)) as TypedFile[] | undefined;
    if (!files) return;
    await db.put(STORE_NAME, files.filter(f => f.type !== type), key);
}

// Supprime tous les fichiers associés à une clé
export async function clearFiles(key: string) {
    const db = await getFileDB();
    await db.delete(STORE_NAME, key);
}
