import { UserEditSchemaType, UserSchemaType } from "@/lib/zod/user.schema";
import { RequestResponse } from "@/types/api.types";
import { UserType } from "@/types/user.types";

export async function all(data?: string[]) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
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

export async function unique({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/${id}`, {
            method: 'GET',
        });

        const res: RequestResponse<UserType> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/${id}/collaborator`, {
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

export async function create(data: UserSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data }),
        });

        const res: RequestResponse<UserType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res
    } catch (error) {
        throw error;
    }
}

export async function hasEmail({ id, email }: { id: string; email: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, id }),
        });

        const res: RequestResponse<undefined> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res
    } catch (error) {
        throw error;
    }
}

export async function edit(data: UserEditSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/${data.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...data }),
        });

        const res: RequestResponse<UserType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res
    } catch (error) {
        throw error;
    }
}

export async function editProfil({ id, image }: { id: string; image?: File }) {
    const formData = new FormData();
    formData.append("profil", image as File)

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/${id}/profil`, {
            method: 'PUT',
            body: formData,
        });

        const res: RequestResponse<UserType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function editPassport({ id, image }: { id: string; image?: File }) {
    const formData = new FormData();

    // Ajout uniquement si image est définie
    if (image) {
        formData.append("passport", image);
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/${id}/passport`, {
            method: 'PUT',
            body: formData,
        });

        const res: RequestResponse<UserType> = await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }

        return res;

    } catch (error) {
        throw error;
    }
}

export async function editOther({ id, image }: { id: string; image?: File }) {
    const formData = new FormData();

    if (image) {
        formData.append("other", image);
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/${id}/other`, {
            method: 'PUT',
            body: formData,
        });

        const res: RequestResponse<UserType> = await response.json();
        if (!response.ok) {
            throw new Error(res.message);
        }

        return res;

    } catch (error) {
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/employee/${id}`, {
            method: 'DELETE',
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





