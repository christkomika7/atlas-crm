import { toDateOnlyString } from "@/lib/date";
import { InvoiceSchemaType, InvoiceUpdateSchemaType } from "@/lib/zod/invoice.schema";
import { InvoicePaymentSchemaType } from "@/lib/zod/payment.schema";
import { RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { ItemType, LocationBillboardDateType } from "@/stores/item.store";
import { RequestResponse } from "@/types/api.types";
import { InvoiceType, PaidInfosInvoiceType, RecurrenceType } from "@/types/invoice.types";

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

export async function all({ companyId, filter }: { companyId: string, filter?: "unpaid" | "paid" }) {
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


export async function expireInvoices({ companyId }: { companyId: string }) {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${companyId}/expire`, {
            method: 'GET',
        });

        const res: RequestResponse<PaidInfosInvoiceType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function noExpireInvoices({ companyId }: { companyId: string }) {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${companyId}/no-expire`, {
            method: 'GET',
        });

        const res: RequestResponse<PaidInfosInvoiceType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getLatestInvoice({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${companyId}/last`, {
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


export async function getBillboardItemLocations({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${companyId}/location`, {
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

        const normalizedBillboards = (data.item.billboards ?? []).map((b) => ({
            ...b,
            locationStart: toDateOnlyString(b.locationStart as unknown as string | Date),
            locationEnd: toDateOnlyString(b.locationEnd as unknown as string | Date),
        }));

        formData.append("clientId", data.clientId);
        formData.append("projectId", data.projectId);
        formData.append("companyId", data.companyId);
        formData.append("totalHT", data.totalHT.toString());
        formData.append("invoiceNumber", JSON.stringify(data.invoiceNumber));
        formData.append("paymentLimit", data.paymentLimit);
        formData.append("productServices", JSON.stringify(data.item.productServices));
        formData.append("billboards", JSON.stringify(normalizedBillboards));
        formData.append("discount", data.discount || "0");
        formData.append("discountType", data.discountType);
        formData.append("totalTTC", data.totalTTC.toString());
        formData.append("payee", data.payee?.toString() || "0");
        formData.append("note", data.note ?? "");
        formData.append("amountType", data.amountType);

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

export async function createdPayment(data: InvoicePaymentSchemaType) {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${data.recordId}/payment`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data, date: toDateOnlyString(data.date) }),
        });

        const res: RequestResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du paiement");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}


export async function createRecurrence(data: RecurrenceType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${data.invoiceId}/recurrence`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du paiement");
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

        const normalizedBillboards = (data.item.billboards ?? []).map((b) => ({
            ...b,
            locationStart: toDateOnlyString(b.locationStart as unknown as string | Date),
            locationEnd: toDateOnlyString(b.locationEnd as unknown as string | Date),
        }));

        formData.append("id", data.id);
        formData.append("clientId", data.clientId);
        formData.append("projectId", data.projectId);
        formData.append("companyId", data.companyId);
        formData.append("totalHT", data.totalHT.toString());
        formData.append("amountType", data.amountType);
        formData.append("paymentLimit", data.paymentLimit);
        formData.append("invoiceNumber", JSON.stringify(data.invoiceNumber));
        formData.append("productServices", JSON.stringify(data.item.productServices));
        formData.append("billboards", JSON.stringify(normalizedBillboards));
        formData.append("discount", data.discount ?? "0");
        formData.append("discountType", data.discountType);
        formData.append("totalTTC", data.totalTTC.toString());
        formData.append("payee", data.payee?.toString() || "0");
        formData.append("note", data.note ?? "");
        formData.append("lastUploadFiles", JSON.stringify(data.lastUploadFiles));

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

export async function share(data: RecordEmailSchemaType) {
    const formData = new FormData();

    formData.append("companyId", data.companyId);
    formData.append("recordId", data.recordId);
    formData.append("subject", data.subject ?? "");
    formData.append("message", data.message ?? "");
    formData.append("emails", JSON.stringify(data.emails));
    formData.append("blob", data.blob);

    data.file?.forEach((file) => {
        if (file instanceof File) {
            formData.append("files", file);
        }
    });

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/share`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors du partage de la facture");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function duplicateInvoice({ invoiceId, duplicateTo, items }: { invoiceId: string, duplicateTo?: "invoice" | "quote" | "delivery-note", items?: ItemType[] }) {
    const params = new URLSearchParams();
    if (duplicateTo) params.append("type", duplicateTo);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/invoice/${invoiceId}/duplicate${queryString ? `?${queryString}` : ""
        }`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(items || []),
        });

        const res: RequestResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la duplication de la facture");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction duplicate:", error);
        throw error;
    }
}