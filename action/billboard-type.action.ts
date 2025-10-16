import { BillboardTypeSchemaType } from "@/lib/zod/billboard-type.schema";
import { RequestResponse } from "@/types/api.types";
import { BillboardTypeType } from "@/types/billboard-type.types";

export async function all({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard_type/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<BillboardTypeType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function create(data: BillboardTypeSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard_type`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<BillboardTypeType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du type de panneau");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}


export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/billboard_type/${id}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<BillboardTypeType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}