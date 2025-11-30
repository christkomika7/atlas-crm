import { AppointmentSchemaType, EditAppointmentSchemaType } from "@/lib/zod/appointment.schema";
import { RequestResponse } from "@/types/api.types";
import { AppointmentType, GetAppointmentsParams } from "@/types/appointment.type";

export async function all(params: GetAppointmentsParams) {
    try {
        const query = new URLSearchParams();

        if (params.skip !== undefined) query.set("skip", String(params.skip));
        if (params.take !== undefined) query.set("take", String(params.take));

        if (params.type) query.set("type", params.type);

        const sortKeys: string[] = ["byDate", "byClient", "byEmail", "byTime", "byAddress", "byCompany"];

        for (const key of sortKeys) {
            if (params[key]) {
                query.set(key, String(params[key]));
                break;
            }
        }

        const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/appointment/${params.companyId}?${query.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const res: RequestResponse<AppointmentType[]> = await response.json();

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/appointment/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<AppointmentType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: AppointmentSchemaType) {
    try {
        const formData = new FormData();
        formData.append("client", data.client);
        formData.append("company", data.company);
        formData.append("email", data.email);
        formData.append("date", data.date.toLocaleDateString());
        formData.append("notify", JSON.stringify(data.notify))
        formData.append("time", data.time);
        formData.append("subject", data.subject);
        formData.append("address", data.address);

        data.uploadDocuments?.forEach((file) => {
            if (file instanceof File) {
                formData.append("uploadDocuments", file);
            }
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/appointment`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<AppointmentType[]> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du client");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: EditAppointmentSchemaType) {
    try {
        const formData = new FormData();
        formData.append("id", data.id);
        formData.append("client", data.client);
        formData.append("company", data.company);
        formData.append("email", data.email);
        formData.append("notify", JSON.stringify(data.notify))
        formData.append("date", data.date.toLocaleDateString());
        formData.append("time", data.time);
        formData.append("subject", data.subject);
        formData.append("address", data.address);
        formData.append("lastUploadDocuments", data.lastUploadDocuments?.join(";") as string)

        data.uploadDocuments?.forEach((file) => {
            if (file instanceof File) {
                formData.append("uploadDocuments", file);
            }

        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/appointment/${data.id}`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<AppointmentType[]> = await response.json();

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/appointment/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<AppointmentType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/appointment`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids }),
        });

        const res: RequestResponse<AppointmentType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
