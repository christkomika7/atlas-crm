import { z } from "zod";

export const projectSchema = z.object({
    client: z.string().min(1, {
        message: "Le client est requis.",
    }),
    company: z.string().min(1, {
        message: "Aucune entreprise trouvé.",
    }),
    projectName: z.string().min(1, {
        message: "Le nom du projet est requis.",
    }),
    deadline: z.date().min(1, { message: "La date limite est requise." }),
    projectInfo: z.string().optional(),
    uploadDocuments: z
        .array(z.instanceof(File))
        .optional(),
    collaborators: z
        .array(
            z
                .string()
                .min(1, "Le nom du collaborateur ne peut pas être vide.")
            ,
        )
        .min(1, { message: "Au moins un collaborateur est requis." }),
});


export const editProjectSchema = z.object({
    id: z.string().min(1, { message: "Id obligatoire." }),
    client: z.string().min(1, {
        message: "Le client est requis.",
    }),
    company: z.string().min(1, {
        message: "Aucune entreprise trouvé.",
    }),
    projectName: z.string().min(1, {
        message: "Le nom du projet est requis.",
    }),
    deadline: z.date({
        error: "La date limite est requise.",
    }),
    projectInfo: z.string().optional(),
    uploadDocuments: z
        .array(z.instanceof(File))
        .optional(),
    collaborators: z
        .array(
            z
                .string()
                .min(1, "Le nom du collaborateur ne peut pas être vide.")
        )
        .min(1, { message: "Au moins un collaborateur est requis." }),
    lastUploadDocuments: z.array(z.string()).optional()
});


export type ProjectSchemaType = z.infer<typeof projectSchema>;
export type EditProjectSchemaType = z.infer<typeof editProjectSchema>;