import { $Enums } from '@/lib/generated/prisma';
import { EditProductServiceSchemaType, ProductServiceSchemaType } from "@/lib/zod/product-service.schema";
import { RequestResponse } from "@/types/api.types";
import { ProductServiceType } from "@/types/product-service.types";

export async function getAllProductServices({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/product_service/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<ProductServiceType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function all({ companyId, filter, search, limit }: { companyId: string, search?: string, limit?: number; filter?: $Enums.ProductServiceType }) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (limit) params.append("limit", String(limit));
    if (filter) params.append("filter", String(filter))

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/product_service/${companyId}${queryString ? `?${queryString}` : ""}`

    try {
        const response = await fetch(url, {
            method: 'POST',
        });

        const res: RequestResponse<ProductServiceType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function unique({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/product_service/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<ProductServiceType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: ProductServiceSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/product_service`, {
            method: "POST",

            body: JSON.stringify({ ...data }),
        });

        const res: RequestResponse<ProductServiceType[]> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du produit ou service");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: EditProductServiceSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/product_service/${data.id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data }),
        });

        const res: RequestResponse<ProductServiceType[]> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la modification du produit ou service");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/product_service/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<ProductServiceType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function removeMany({ ids }: { ids: string[] }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/product_service`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
        });

        const res: RequestResponse<ProductServiceType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
