import { AreaSchemaType } from "@/lib/zod/area.schema";
import { RequestResponse } from "@/types/api.types";
import { AreaType } from "@/types/area.types";

export async function all({ cityId }: { cityId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/area/${cityId}`, {
            method: 'GET',
        });

        const res: RequestResponse<AreaType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function create(data: AreaSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/area`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<AreaType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de l'emplacement");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}


export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/area/${id}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<AreaType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}