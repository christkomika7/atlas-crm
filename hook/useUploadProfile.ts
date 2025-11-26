import { useState } from "react";

type UploadProfileParams = {
    folder: string;
    image?: File | null;
};

type UploadResult = {
    success: boolean;
    path?: string;
    error?: string;
};


export function useUploadProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePath, setImagePath] = useState<string | null>(null);

    /**
     * Upload l'image vers l'API et retourne le chemin du fichier uploadé
     */
    async function handleUpload({
        folder,
        image,
    }: UploadProfileParams): Promise<UploadResult> {
        setLoading(true);
        setError(null);

        try {
            if (!image) {
                return { success: true };
            }

            const formData = new FormData();
            formData.append("profil", image);
            formData.append("path", folder);  // clé path = dossier cible sur le serveur

            const response = await fetch("/api/upload/profile", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur inconnue lors de l'envoi du fichier.");
            }

            setImagePath(data.path);
            return { success: true, path: data.path };
        } catch (err: any) {
            const errorMsg = err?.message || "Une erreur est survenue.";
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }

    return {
        handleUpload,
        loading,
        error,
        imagePath,
    };
}
