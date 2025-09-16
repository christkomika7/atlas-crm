import { z } from "zod";

export const taskStepSchema = z.object({
    taskId: z.string().min(1, { message: "L'id de la tâche est obligatoire." }),
    check: z.boolean(),
    stepName: z.string().min(1, {
        message: "Ce champ est obligatoire."
    }),
});


export const editTaskStepSchema = z.object({
    id: z.string().min(1, { message: "L'id de l'étape de tâche est obligatoire." }),
    taskId: z.string().min(1, { message: "L'id de la tâche est obligatoire." }),
    check: z.boolean(),
    stepName: z.string().min(1, {
        message: "Ce champ est obligatoire."
    }),
});

export type TaskStepSchemaType = z.infer<typeof taskStepSchema>;
export type EditTaskStepSchemaType = z.infer<typeof editTaskStepSchema>;