import { CitySchemaType } from "@/lib/zod/city.schema";
import { RequestResponse } from "@/types/api.types";
import { CityType } from "@/types/city.types";

export async function all({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/city/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<CityType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function create(data: CitySchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/city`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<CityType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de la ville");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}


export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/city/${id}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<CityType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}