import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import { toDateOnlyString } from "@/lib/date";
import { QuoteSchemaType, QuoteUpdateSchemaType } from "@/lib/zod/quote.schema";
import { RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { ItemType, LocationBillboardDateType } from "@/stores/item.store";
import { RequestResponse } from "@/types/api.types";
import { QuoteType } from "@/types/quote.types";

export async function quoteNumber({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/${companyId}`, {
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

export async function getAllQuotes(
    { companyId, filter, search, skip = 0, take = DEFAULT_PAGE_SIZE, }:
        { companyId: string, filter?: "progress" | "complete", search?: string, skip?: number; take?: number; }) {


    const params = new URLSearchParams();
    if (filter) params.append("type", filter);
    if (search) params.append("search", search);

    params.append("skip", String(skip));
    params.append("take", String(take));

    const queryString = params.toString();

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/${companyId}/all${queryString ? `?${queryString}` : ""
        }`;

    try {
        const response = await fetch(url, {
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

export async function getBillboardItemLocations({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/${companyId}/location`, {
            method: 'GET',
        });

        const res: RequestResponse<LocationBillboardDateType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getUniqueQuote({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<QuoteType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function createQuote(data: QuoteSchemaType) {
    try {
        const formData = new FormData();

        const normalizedBillboards = (data.item.billboards ?? []).map((b) => ({
            ...b,
            locationStart: toDateOnlyString(b.locationStart as unknown as string | Date),
            locationEnd: toDateOnlyString(b.locationEnd as unknown as string | Date),
        }));

        formData.append("clientId", data.clientId);
        formData.append("companyId", data.companyId);
        formData.append("amountType", data.amountType);
        formData.append("totalHT", data.totalHT.toString());
        formData.append("quoteNumber", JSON.stringify(data.quoteNumber));
        formData.append("paymentLimit", data.paymentLimit);
        formData.append("productServices", JSON.stringify(data.item.productServices));
        formData.append("billboards", JSON.stringify(normalizedBillboards));
        formData.append("discount", data.discount || "0");
        formData.append("discountType", data.discountType);
        formData.append("totalTTC", data.totalTTC.toString());
        formData.append("note", data.note ?? "");

        data.files?.forEach((file) => {
            if (file instanceof File) {
                formData.append("files", file);
            }
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<QuoteType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du devis");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}


export async function updateQuote(data: QuoteUpdateSchemaType) {
    try {
        const formData = new FormData();

        const normalizedBillboards = (data.item.billboards ?? []).map((b) => ({
            ...b,
            locationStart: toDateOnlyString(b.locationStart as unknown as string | Date),
            locationEnd: toDateOnlyString(b.locationEnd as unknown as string | Date),
        }));

        formData.append("id", data.id)
        formData.append("clientId", data.clientId);
        formData.append("companyId", data.companyId);
        formData.append("amountType", data.amountType);
        formData.append("totalHT", data.totalHT.toString());
        formData.append("quoteNumber", JSON.stringify(data.quoteNumber));
        formData.append("paymentLimit", data.paymentLimit);
        formData.append("productServices", JSON.stringify(data.item.productServices));
        formData.append("billboards", JSON.stringify(normalizedBillboards));
        formData.append("discount", data.discount || "0");
        formData.append("discountType", data.discountType);
        formData.append("totalTTC", data.totalTTC.toString());
        formData.append("note", data.note ?? "");
        formData.append("lastUploadFiles", JSON.stringify(data.lastUploadFiles));

        data.files?.forEach((file) => {
            if (file instanceof File) {
                formData.append("files", file);
            }
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/${data.id}`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<QuoteType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la modification du devis");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}

export async function removeQuote({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/${id}`, {
            method: 'DELETE',

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

export async function removeManyQuotes({ ids }: { ids: string[] }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
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

export async function shareQuote(data: RecordEmailSchemaType) {
    const formData = new FormData();

    formData.append("companyId", data.companyId);
    formData.append("recordId", data.recordId);
    formData.append("subject", data.subject ?? "");
    formData.append("message", data.message ?? "");
    formData.append("emails", JSON.stringify(data.emails));
    formData.append("blob", data.blob)

    data.file?.forEach((file) => {
        if (file instanceof File) {
            formData.append("files", file);
        }
    });

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/share`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors du partage du devis");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction share:", error);
        throw error;
    }
}


export async function duplicateQuote({ id, duplicateTo }: { id: string, duplicateTo: "delivery-note" | "quote" }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/${id}/duplicate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ duplicateTo }),
        });

        const res: RequestResponse<null> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function convertQuote({ id, items }: { id: string, items?: ItemType[] }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/quote/${id}/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(items || []),
        });

        const res: RequestResponse<string> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}