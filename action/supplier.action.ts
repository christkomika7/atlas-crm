import { SupplierSchemaType, EditSupplierSchemaType } from "@/lib/zod/supplier.schema";
import { RequestResponse } from "@/types/api.types";
import { SupplierType } from "@/types/supplier.types";

export async function all({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/supplier/${id}`, {
            method: 'GET',
        });

        const res: RequestResponse<SupplierType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/supplier/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<SupplierType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: SupplierSchemaType & { id: string }) {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/supplier/${data.id}`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<SupplierType[]> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du fournisseur");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: EditSupplierSchemaType) {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/supplier/${data.id}/edit`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<SupplierType[]> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la modification du fournisseur");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/supplier/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<SupplierType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/supplier`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
        });

        const res: RequestResponse<SupplierType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
