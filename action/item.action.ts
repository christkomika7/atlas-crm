import { RequestResponse } from "@/types/api.types";
import { ItemType } from "@/types/item.type";

export async function allBillboardItem({ billboardId }: { billboardId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/item/${billboardId}`, {
            method: 'GET',
        });

        const res: RequestResponse<ItemType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
