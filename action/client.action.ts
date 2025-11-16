import { ClientSchemaType, EditClientSchemaType } from "@/lib/zod/client.schema";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { InvoiceType } from "@/types/invoice.types";
import { QuoteType } from "@/types/quote.types";

export async function all({ id, filter }: { id: string, filter?: string }) {
    const params = new URLSearchParams();
    if (filter) params.append("filter", filter);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${id}${queryString ? `?${queryString}` : ""
        }`;
    try {
        const response = await fetch(url, {
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
        formData.append("job", data.job || "");
        formData.append("legalForms", data.legalForms);
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
        formData.append("job", data.job || "");
        formData.append("legalForms", data.legalForms);
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

export async function getInvoice({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${id}/invoice`, {
            method: 'GET',
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


export async function getQuote({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${id}/quote`, {
            method: 'GET',
        });

        const res: RequestResponse<QuoteType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function getDeliveryNote({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/client/${id}/delivery-note`, {
            method: 'GET',
        });

        const res: RequestResponse<DeliveryNoteType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
