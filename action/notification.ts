import { RequestResponse } from "@/types/api.types";
import { NotificationType } from "@/types/notification.type";

export async function getNotifications({
    companyId,
    skip = 0,
    take = 10
}: {
    companyId: string;
    skip?: number;
    take?: number;
}) {
    const params = new URLSearchParams();

    params.append("skip", String(skip));
    params.append("take", String(take));

    const queryString = params.toString();

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/notification/${companyId}${queryString ? `?${queryString}` : ""
        }`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<NotificationType[]> = await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function checkNewNotifications({
    companyId
}: {
    companyId: string;
}) {
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/notification/${companyId}/new`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            cache: "no-store"
        });

        const res: RequestResponse<{ hasUnread: boolean; count: number }> = await response.json();

        if (!response.ok) {
            throw new Error(res.message);
        }

        return res;

    } catch (error) {
        throw error;
    }
}


export async function markNotificationAsRead({ notificationId }: { notificationId: string }) {
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/notification/${notificationId}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationId }),
        });

        const res: RequestResponse<null> = await response.json();

        if (!response.ok) {
            throw new Error(res.message);
        }

        return res;

    } catch (error) {
        throw error;
    }
}


export async function confirmNotificationAction({
    notificationId,
    action
}: {
    notificationId: string;
    action: 'validate' | 'cancel';
}) {
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/notification/confirm`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                notificationId,
                action
            }),
        });

        const res: RequestResponse<NotificationType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message);
        }

        return res;

    } catch (error) {
        throw error;
    }
}
