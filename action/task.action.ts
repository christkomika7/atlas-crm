import { $Enums } from '@/lib/generated/prisma';
import { EditTaskSchemaType, TaskSchemaType } from "@/lib/zod/task.schema";
import { RequestResponse } from "@/types/api.types";
import { TaskType } from "@/types/task.type";


export async function all({ projectId }: { projectId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/task/${projectId}`, {
            method: 'GET',
        });

        const res: RequestResponse<TaskType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/task/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<TaskType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function updateStatus({ id, status }: { id: string, status: $Enums.ProjectStatus }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/task/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(status),
        });

        const res: RequestResponse<TaskType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: TaskSchemaType) {
    try {
        const formData = new FormData();
        formData.append("projectId", data.projectId);
        formData.append("taskName", data.taskName);
        formData.append("description", data.description ?? "");
        formData.append("time", data.time.toLocaleDateString());
        formData.append("comment", data.comment ?? "");
        formData.append("priority", data.priority);
        formData.append("status", data.status);
        formData.append("users", JSON.stringify(data.users));

        data.uploadDocuments?.forEach((file) => {
            if (file instanceof File) {
                formData.append("uploadDocuments", file);
            }

        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/task`, {
            method: "POST",
            body: formData,
        });

        const res: RequestResponse<TaskType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de la tâche");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: EditTaskSchemaType) {
    try {
        const formData = new FormData();
        formData.append("id", data.id);
        formData.append("projectId", data.projectId);
        formData.append("taskName", data.taskName);
        formData.append("description", data.description ?? "");
        formData.append("time", data.time.toLocaleDateString());
        formData.append("comment", data.comment ?? "");
        formData.append("priority", data.priority);
        formData.append("status", data.status);
        formData.append("users", JSON.stringify(data.users));
        formData.append("lastUploadDocuments", JSON.stringify(data.lastUploadDocuments))

        data.uploadDocuments?.forEach((file) => {
            if (file instanceof File) {
                formData.append("uploadDocuments", file);
            }

        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/task/${data.id}`, {
            method: "PUT",
            body: formData,
        });

        const res: RequestResponse<TaskType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la modification de la tâche");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction update:", error);
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/task/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<TaskType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}