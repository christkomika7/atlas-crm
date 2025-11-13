import { RequestResponse } from "@/types/api.types";
import { PaymentType } from "@/types/payment.types";

export async function getPayments({ recordId, recordName }: { recordId: string, recordName: 'invoice' | 'purchase-order' }) {
    const params = new URLSearchParams();
    if (recordId) params.append("recordId", String(recordId));
    if (recordName) params.append("recordName", recordName);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/payment${queryString ? `?${queryString}` : ""
        }`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        const res: RequestResponse<PaymentType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function removePayment({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/payment/${id}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<PaymentType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}