import { ClientSchemaType, EditClientSchemaType } from "@/lib/zod/client.schema";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";

export async function all({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${id}`, {
            method: 'GET',
        });

        const res: RequestResponse<ClientType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<ClientType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: ClientSchemaType & { id: string }) {
    try {
        const formData = new FormData();
        formData.append("companyName", data.companyName);
        formData.append("lastname", data.lastname);
        formData.append("firstname", data.firstname);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("website", data.website ?? "");
        formData.append("address", data.address);
        formData.append("businessSector", data.businessSector);
        formData.append("businessRegistrationNumber", data.businessRegistrationNumber);
        formData.append("taxIdentificationNumber", data.taxIdentificationNumber);
        formData.append("discount", data.discount);
        formData.append("paymentTerms", data.paymentTerms);
        formData.append("information", data.information);

        data.uploadDocuments?.forEach((file) => {
            if (file instanceof File) {
                formData.append("uploadDocuments", file);
            }

        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${data.id}`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<ClientType[]> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du client");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: EditClientSchemaType) {
    try {
        const formData = new FormData();
        formData.append("id", data.id);
        formData.append("companyName", data.companyName);
        formData.append("lastname", data.lastname);
        formData.append("firstname", data.firstname);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("website", data.website ?? "");
        formData.append("address", data.address);
        formData.append("businessSector", data.businessSector);
        formData.append("businessRegistrationNumber", data.businessRegistrationNumber);
        formData.append("taxIdentificationNumber", data.taxIdentificationNumber);
        formData.append("discount", data.discount);
        formData.append("paymentTerms", data.paymentTerms);
        formData.append("information", data.information);
        formData.append("lastUploadDocuments", data.lastUploadDocuments?.join(";") as string)

        data.uploadDocuments?.forEach((file) => {
            if (file instanceof File) {
                formData.append("uploadDocuments", file);
            }

        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${data.id}/edit`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<ClientType[]> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du client");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<ClientType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
        });

        const res: RequestResponse<ClientType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
