import { RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { PurchaseOrderPaymentSchemaType } from "@/lib/zod/payment.schema";
import { PurchaseOrderSchemaType, PurchaseOrderUpdateSchemaType } from "@/lib/zod/purchase-order.schema";
import { RequestResponse } from "@/types/api.types";
import { RecurrenceType } from "@/types/invoice.types";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { toDateOnlyString } from "@/lib/date";

export async function purchaseOrderNumber({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order/${companyId}`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order/${companyId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: filter }),
        });

        const res: RequestResponse<PurchaseOrderType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<PurchaseOrderType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: PurchaseOrderSchemaType) {
    try {
        const formData = new FormData();
        formData.append("supplierId", data.supplierId);
        formData.append("projectId", data.projectId);
        formData.append("companyId", data.companyId);
        formData.append("totalHT", data.totalHT.toString());
        formData.append("purchaseOrderNumber", JSON.stringify(data.purchaseOrderNumber));
        formData.append("paymentLimit", data.paymentLimit);
        formData.append("productServices", JSON.stringify(data.item.productServices));
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<PurchaseOrderType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du bon ce commande");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function createdPayment(data: PurchaseOrderPaymentSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order/${data.recordId}/payment`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order/${data.invoiceId}/recurrence`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de la récurrence");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: PurchaseOrderUpdateSchemaType) {
    try {
        const formData = new FormData();
        formData.append("id", data.id);
        formData.append("supplierId", data.supplierId);
        formData.append("projectId", data.projectId);
        formData.append("companyId", data.companyId);
        formData.append("totalHT", data.totalHT.toString());
        formData.append("amountType", data.amountType);
        formData.append("paymentLimit", data.paymentLimit);
        formData.append("purchaseOrderNumber", JSON.stringify(data.purchaseOrderNumber));
        formData.append("productServices", JSON.stringify(data.item.productServices));
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order/${data.id}`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<PurchaseOrderType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la modification du bon de commande");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<PurchaseOrderType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
        });

        const res: RequestResponse<PurchaseOrderType[]> = await response.json()
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
    formData.append("blob", data.blob)

    data.file?.forEach((file) => {
        if (file instanceof File) {
            formData.append("files", file);
        }
    });

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/purchase-order/share`, {
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