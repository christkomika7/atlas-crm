import { EditTaskStepSchemaType, TaskStepSchemaType } from "@/lib/zod/task-step.schema";
import { RequestResponse } from "@/types/api.types";
import { TaskStepType } from "@/types/step.type";

export async function all({ taskId }: { taskId: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/step/${taskId}`, {
            method: 'GET',
        });

        const res: RequestResponse<TaskStepType[]> = await response.json()
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/step/${id}/unique`, {
            method: 'GET',
        });

        const res: RequestResponse<TaskStepType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}

export async function create(data: TaskStepSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/step`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<TaskStepType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de l'étape de la tâche");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function update(data: EditTaskStepSchemaType) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/step/${data.id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const res: RequestResponse<TaskStepType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de l'étape de la tâche");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function check({ id, check }: { id: string, check: boolean }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/step/${id}/check`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(check),
        });

        const res: RequestResponse<TaskStepType> = await response.json();

        if (!response.ok) {
            throw new Error(res.message || "Erreur lors de la création de l'étape de la tâche");
        }

        return res;
    } catch (error) {
        console.error("Erreur dans la fonction create:", error);
        throw error;
    }
}

export async function remove({ id }: { id: string }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/step/${id}`, {
            method: 'DELETE',

        });

        const res: RequestResponse<TaskStepType> = await response.json()
        if (!response.ok) {
            throw new Error(res.message);
        }
        return res;

    } catch (error) {
        throw error;
    }
}