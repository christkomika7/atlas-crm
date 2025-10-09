import { z } from "zod";

export const taskSchema = z.object({
    projectId: z.string().min(1, { message: "L'identifiant du projet est obligatoire." }),
    taskName: z
        .string().min(1, { message: "Le nom de la tâche est requis." }),
    description: z
        .string()
        .optional(),
    time: z
        .date().min(1, { message: "La date de la tâche est requise." }),
    priority: z
        .string().min(1, { message: "La priorité est requise." }),
    comment: z
        .string()
        .optional(),
    status: z
        .string().min(1, { message: "Le statut est requis." }),
    users: z
        .array(z.string())
        .min(1, { message: "Au moins un utilisateur doit être assigné à la tâche." }),
    uploadDocuments: z
        .array(z.instanceof(File))
        .optional(),
});

export const editTaskSchema = z.object({
    id: z.string().min(1, { message: "Id obligatoire." }),
    projectId: z.string().min(1, { message: "L'identifiant du projet est obligatoire." }),
    taskName: z
        .string().min(1, { message: "Le nom de la tâche est requis." }),
    description: z
        .string()
        .optional(),
    time: z
        .date().min(1, { message: "La date de la tâche est requise." }),
    priority: z
        .string().min(1, { message: "La priorité est requise." }),
    comment: z
        .string()
        .optional(),
    status: z
        .string().min(1, { message: "Le statut est requis." }),
    users: z
        .array(z.string())
        .min(1, { message: "Au moins un utilisateur doit être assigné à la tâche." }),
    uploadDocuments: z
        .array(z.instanceof(File))
        .optional(),
    lastUploadDocuments: z.array(z.string()).optional()
});

export type TaskSchemaType = z.infer<typeof taskSchema>;
export type EditTaskSchemaType = z.infer<typeof editTaskSchema>;