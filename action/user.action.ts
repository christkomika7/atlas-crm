import { UserEditSchemaType, UserSchemaType } from "@/lib/zod/user.schema";
import { RequestResponse } from "@/types/api.types";
import { ProfileType, UserType } from "@/types/user.types";


export async function getUsersByCompany({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user/${companyId}`, {
            method: 'GET',
        });

        const res: RequestResponse<ProfileType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getAllUsers() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user`, {
            method: 'GET',
        });

        const res: RequestResponse<UserType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function createUserByCompany({ companyId, data }: { companyId: string, data: UserSchemaType }) {
    try {
        const formData = new FormData();

        if (data.image) formData.append('image', data.image);
        if (data.userId) formData.append("userId", data.userId);

        formData.append("firstname", data.firstname);
        formData.append("lastname", data.lastname);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("job", data.job);
        formData.append("salary", data.salary);
        formData.append("password", data.password);

        formData.append("appointment", JSON.stringify(data.appointment));
        formData.append("billboards", JSON.stringify(data.billboards));
        formData.append("clients", JSON.stringify(data.clients));
        formData.append("contract", JSON.stringify(data.contract));
        formData.append("creditNotes", JSON.stringify(data.creditNotes));
        formData.append("dashboard", JSON.stringify(data.dashboard));
        formData.append("deliveryNotes", JSON.stringify(data.deliveryNotes));
        formData.append("invoices", JSON.stringify(data.invoices));
        formData.append("productServices", JSON.stringify(data.productServices));
        formData.append("projects", JSON.stringify(data.projects));
        formData.append("purchaseOrder", JSON.stringify(data.purchaseOrder));
        formData.append("quotes", JSON.stringify(data.quotes));
        formData.append("setting", JSON.stringify(data.setting));
        formData.append("suppliers", JSON.stringify(data.suppliers));
        formData.append("transaction", JSON.stringify(data.transaction));

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user/${companyId}`, {
            method: 'POST',
            body: formData,

        });

        const res: RequestResponse<ProfileType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function updateUserByCompany({ profileId, data }: { profileId: string, data: UserEditSchemaType }) {
    try {
        const formData = new FormData();
        const image = data.image instanceof File ? data.image : String(data.image)
        formData.append('image', image)
        formData.append("firstname", data.firstname);
        formData.append("lastname", data.lastname);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("job", data.job);
        formData.append("salary", data.salary);
        formData.append("password", data.password || "");
        formData.append("newPassword", data.newPassword || "");

        formData.append("appointment", JSON.stringify(data.appointment));
        formData.append("billboards", JSON.stringify(data.billboards));
        formData.append("clients", JSON.stringify(data.clients));
        formData.append("contract", JSON.stringify(data.contract));
        formData.append("creditNotes", JSON.stringify(data.creditNotes));
        formData.append("dashboard", JSON.stringify(data.dashboard));
        formData.append("deliveryNotes", JSON.stringify(data.deliveryNotes));
        formData.append("invoices", JSON.stringify(data.invoices));
        formData.append("productServices", JSON.stringify(data.productServices));
        formData.append("projects", JSON.stringify(data.projects));
        formData.append("purchaseOrder", JSON.stringify(data.purchaseOrder));
        formData.append("quotes", JSON.stringify(data.quotes));
        formData.append("setting", JSON.stringify(data.setting));
        formData.append("suppliers", JSON.stringify(data.suppliers));
        formData.append("transaction", JSON.stringify(data.transaction));

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user/${profileId}`, {
            method: 'PUT',
            body: formData,
        });

        const res: RequestResponse<ProfileType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getUser({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<ProfileType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function editProfileDocument({ profileId, document, type, state }: { profileId: string; document?: File; type: "doc" | "passport", state: "update" | "delete" }) {
    try {
        const formData = new FormData();
        if (document) formData.append('document', document);
        formData.append("type", type);
        formData.append("state", state);

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user/${profileId}/document`, {
            method: 'PUT',
            body: formData,

        });

        const res: RequestResponse<ProfileType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getUserByCurrentCompany({ userId, companyId }: { userId: string, companyId: string }) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("companyId", companyId);

    const queryString = params.toString();
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user/current${queryString ? `?${queryString}` : ""
        }`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        const res: RequestResponse<ProfileType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function getCollaborators({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user/${id}/collaborator`, {
            method: 'GET',
        });

        const res: RequestResponse<ProfileType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function deleteUser({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/user/${id}`, {
            method: 'DELETE',
        });

        const res: RequestResponse<ProfileType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}







