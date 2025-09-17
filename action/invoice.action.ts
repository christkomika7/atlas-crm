import { InvoiceSchemaType, InvoiceUpdateSchemaType } from "@/lib/zod/invoice.schema";
import { RequestResponse } from "@/types/api.types";
import { InvoiceType } from "@/types/invoice.types";

export async function invoiceNumber({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<number> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function all({ companyId, filter }: { companyId: string, filter: "unpaid" | "paid" }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${companyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: filter }),
        });

        const res: RequestResponse<InvoiceType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<InvoiceType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: InvoiceSchemaType) {
    try {
        const formData = new FormData();
        formData.append("clientId", data.clientId);
        formData.append("projectId", data.projectId);
        formData.append("companyId", data.companyId);
        formData.append("totalHT", data.totalHT);
        formData.append("productServices", JSON.stringify(data.item.productServices));
        formData.append("billboards", JSON.stringify(data.item.billboards));
        formData.append("discount", data.discount ?? "0");
        formData.append("discountType", data.discountType);
        formData.append("totalTTC", data.totalTTC);
        formData.append("payee", data.payee ?? "0");
        formData.append("note", data.note ?? "");

        data.photos?.forEach((file) => {
            if (file instanceof File) {
                formData.append("photos", file);
            }
        });

        data.files?.forEach((file) => {
            if (file instanceof File) {
                formData.append("files", file);
            }
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<InvoiceType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de la facture");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: InvoiceUpdateSchemaType) {
    try {
        const formData = new FormData();
        formData.append("id", data.id);
        formData.append("clientId", data.clientId);
        formData.append("projectId", data.projectId);
        formData.append("companyId", data.companyId);
        formData.append("totalHT", data.totalHT);
        formData.append("invoiceNumber", JSON.stringify(data.invoiceNumber));
        formData.append("productServices", JSON.stringify(data.item.productServices));
        formData.append("billboards", JSON.stringify(data.item.billboards));
        formData.append("discount", data.discount ?? "0");
        formData.append("discountType", data.discountType);
        formData.append("totalTTC", data.totalTTC);
        formData.append("payee", data.payee ?? "0");
        formData.append("note", data.note ?? "");
        formData.append("lastUploadFiles", JSON.stringify(data.lastUploadFiles));
        formData.append("lastUploadPhotos", JSON.stringify(data.lastUploadPhotos));

        data.photos?.forEach((file) => {
            if (file instanceof File) {
                formData.append("photos", file);
            }
        });

        data.files?.forEach((file) => {
            if (file instanceof File) {
                formData.append("files", file);
            }
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${data.id}`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<InvoiceType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la modification de la facture");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<InvoiceType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
        });

        const res: RequestResponse<InvoiceType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
