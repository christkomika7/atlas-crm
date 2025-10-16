import { EditProjectSchemaType, ProjectSchemaType } from "@/lib/zod/project.schema";
import { RequestResponse } from "@/types/api.types";
import { ProjectType } from "@/types/project.types";

export async function getallByCompany({ companyId }: { companyId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/project/${companyId}/company`, {
            method: 'GET',
        });

        const res: RequestResponse<ProjectType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}



export async function allByClient({ clientId }: { clientId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/project/${clientId}/client`, {
            method: 'GET',
        });

        const res: RequestResponse<ProjectType[]> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function uniqueByClient({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/project/${id}`, {
            method: 'GET',
        });

        const res: RequestResponse<ProjectType> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/project/${id}`, {
            method: 'GET',
        });

        const res: RequestResponse<ProjectType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}


export async function create(data: ProjectSchemaType) {

    try {
        const formData = new FormData();
        formData.append("company", data.company);
        formData.append("client", data.client);
        formData.append("projectName", data.projectName);
        formData.append("deadline", data.deadline.toLocaleDateString());
        formData.append("projectInfo", data.projectInfo ?? "");
        formData.append("collaborators", data.collaborators.join(";") as string);

        data.uploadDocuments?.forEach((file) => {
            if (file instanceof File) {
                formData.append("uploadDocuments", file);
            }
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/project`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<ProjectType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création du client");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: EditProjectSchemaType) {
    try {
        const formData = new FormData();
        formData.append("id", data.id);
        formData.append("client", data.client);
        formData.append("company", data.company);
        formData.append("projectName", data.projectName);
        formData.append("deadline", data.deadline.toLocaleDateString());
        formData.append("projectInfo", data.projectInfo ?? "");
        formData.append("collaborators", JSON.stringify(data.collaborators));
        formData.append("lastUploadDocuments", JSON.stringify(data.lastUploadDocuments))

        data.uploadDocuments?.forEach((file) => {
            if (file instanceof File) {
                formData.append("uploadDocuments", file);
            }

        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/project/${data.id}`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<ProjectType[]> = await response.json();

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/project/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<ProjectType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}
