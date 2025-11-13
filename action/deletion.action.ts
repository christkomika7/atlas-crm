import { $Enums } from "@/lib/generated/prisma";
import { RequestResponse } from "@/types/api.types";
import { DeletionType } from "@/types/deletion.types";

export async function getDeletions({ companyId, type }: { companyId: string, type: $Enums.DeletionType }) {
    const params = new URLSearchParams();
    params.append("type", type);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/deletion/${companyId}${queryString ? `?${queryString}` : ""
        }`;

    try {
        const response = await fetch(
            url,
            {
                method: "GET",
            },
        );

        const res: RequestResponse<DeletionType[]> =
            await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}

export async function updateDeletion({ id, type, action, recordId }: { id: string, type: $Enums.DeletionType, action: "cancel" | "delete", recordId: string }) {
    const params = new URLSearchParams();
    params.append("type", type);
    params.append("action", action);
    params.append("recordId", recordId);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/deletion/${id}${queryString ? `?${queryString}` : ""
        }`;

    try {
        const response = await fetch(
            url,
            {
                method: "PUT",
            },
        );

        const res: RequestResponse<DeletionType[]> =
            await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;
    } catch (error) {
        throw error;
    }
}