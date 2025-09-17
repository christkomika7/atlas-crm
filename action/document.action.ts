import { urlToFile } from "@/lib/utils";
import { DocumentSchemaType } from "@/lib/zod/document.schema";
import { RequestResponse } from "@/types/api.types";
import { ModelDocumentType } from "@/types/document.types";

export async function unique({ id }: { id: string }): Promise<RequestResponse<ModelDocumentType<File>>> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/document/${id}`, {
            method: 'GET',
        });

        const res: RequestResponse<ModelDocumentType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        const logo = res.data?.logo ? await urlToFile(res.data.logo) : undefined;


        return {
            ...res,
            data: {
                ...res.data,
                logo,
                company: res.data?.company!,
                id: res.data?.id ?? "",
                companyId: res.data?.companyId ?? "",
                position: res.data?.position ?? "",
                size: res.data?.size ?? "",
                primaryColor: res.data?.primaryColor ?? "#fbbf24",
                secondaryColor: res.data?.secondaryColor ?? "#fef3c7",
                quotesPrefix: res.data?.quotesPrefix ?? "",
                invoicesPrefix: res.data?.invoicesPrefix ?? "",
                deliveryNotesPrefix: res.data?.deliveryNotesPrefix ?? "",
                purchaseOrderPrefix: res.data?.purchaseOrderPrefix ?? "",
                quotesInfo: res.data?.quotesInfo ?? "",
                invoicesInfo: res.data?.invoicesInfo ?? "",
                deliveryNotesInfo: res.data?.deliveryNotesInfo ?? "",
                purchaseOrderInfo: res.data?.purchaseOrderInfo ?? ""
            }
        };

    } catch (error) {
        throw error;
    }
}

export async function create(data: DocumentSchemaType) {
    try {
        const formData = new FormData();
        formData.append("company", data.companyId);

        formData.append("quotesPrefix", data.quotes?.prefix ?? "");
        formData.append("invoicesPrefix", data.invoices?.prefix ?? "");
        formData.append("deliveryNotesPrefix", data.deliveryNotes?.prefix ?? "");
        formData.append("purchaseOrdersPrefix", data.purchaseOrders?.prefix ?? "");

        formData.append("quotesInfo", data.quotes?.notes ?? "")
        formData.append("invoicesInfo", data.invoices?.notes ?? "");
        formData.append("deliveryNotesInfo", data.deliveryNotes?.notes ?? "");
        formData.append("purchaseOrdersInfo", data.purchaseOrders?.notes ?? "");

        formData.append("primaryColor", data.primaryColor ?? "#fbbf24");
        formData.append("secondaryColor", data.secondaryColor ?? "#fef3c7");
        formData.append("position", data.position ?? "");
        formData.append("size", data.size ?? "");
        formData.append("logo", data.logo);



        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/document`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<ModelDocumentType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message ?? "Erreur lors de la création du document");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: DocumentSchemaType & { id: string }) {
    try {
        const formData = new FormData();
        formData.append("company", data.companyId);

        formData.append("quotesPrefix", data.quotes?.prefix ?? "");
        formData.append("invoicesPrefix", data.invoices?.prefix ?? "");
        formData.append("deliveryNotesPrefix", data.deliveryNotes?.prefix ?? "");
        formData.append("purchaseOrdersPrefix", data.purchaseOrders?.prefix ?? "");

        formData.append("quotesInfo", data.quotes?.notes ?? "")
        formData.append("invoicesInfo", data.invoices?.notes ?? "");
        formData.append("deliveryNotesInfo", data.deliveryNotes?.notes ?? "");
        formData.append("purchaseOrdersInfo", data.purchaseOrders?.notes ?? "");
        formData.append("primaryColor", data.primaryColor ?? "#fbbf24");
        formData.append("secondaryColor", data.secondaryColor ?? "#fef3c7");
        formData.append("position", data.position ?? "");
        formData.append("size", data.size ?? "");
        formData.append("logo", data.logo);



        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/document/${data.id}`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<ModelDocumentType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message ?? "Erreur lors de la modification du document");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}