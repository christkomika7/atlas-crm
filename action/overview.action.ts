import { RequestResponse } from "@/types/api.types";
import { RecordType } from "@/types/overview.type";

export async function getRecords({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/overview/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<RecordType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}