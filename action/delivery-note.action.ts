import { toDateOnlyString } from "@/lib/date";
import { DeliveryNoteSchemaType, DeliveryNoteUpdateSchemaType } from "@/lib/zod/delivery-note.schema";
import { RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { LocationBillboardDateType } from "@/stores/item.store";
import { RequestResponse } from "@/types/api.types";
import { DeliveryNoteType } from "@/types/delivery-note.types";

export async function deliveryNoteNumber({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/${companyId}`, {
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

export async function getAllDeliveryNote({ companyId, filter }: { companyId: string, filter: "complete" | "progress" }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/${companyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: filter }),
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

export async function getUniqueDeliveryNote({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<DeliveryNoteType> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/${companyId}/location`, {
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

export async function createDeliveryNote(data: DeliveryNoteSchemaType) {
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
        formData.append("amountType", data.amountType);
        formData.append("totalHT", data.totalHT.toString());
        formData.append("deliveryNoteNumber", JSON.stringify(data.deliveryNoteNumber));
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<DeliveryNoteType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du bon de livraison");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function updateDeliveryNote(data: DeliveryNoteUpdateSchemaType) {
    try {
        const formData = new FormData();

        const normalizedBillboards = (data.item.billboards ?? []).map((b) => ({
            ...b,
            locationStart: toDateOnlyString(b.locationStart as unknown as string | Date),
            locationEnd: toDateOnlyString(b.locationEnd as unknown as string | Date),
        }));

        formData.append("id", data.id)
        formData.append("clientId", data.clientId);
        formData.append("projectId", data.projectId);
        formData.append("companyId", data.companyId);
        formData.append("amountType", data.amountType);
        formData.append("totalHT", data.totalHT.toString());
        formData.append("deliveryNoteNumber", JSON.stringify(data.deliveryNoteNumber));
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/${data.id}`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<DeliveryNoteType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la modification du bon de livraison");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}

export async function removeDeliveryNote({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/${id}`, {
            method: 'DELETE',

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

export async function removeManyDeliveryNotes({ ids }: { ids: string[] }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
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

export async function shareDeliveryNote(data: RecordEmailSchemaType) {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/share`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors du partage du bon de livraison");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction share:", error);
        throw error;
    }
}

export async function completeDeliveryNote({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/${id}/complete`, {
            method: 'POST',
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

export async function duplicateDeliveryNote({ id, duplicateTo }: { id: string, duplicateTo: "delivery-note" | "quote" }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/delivery-note/${id}/duplicate`, {
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
