import * as z from "zod";

export const baseSchema = z.object({
    companyId: z.string().min(1, "L'identifiant de l'entreprise est requis."),
    name: z.string().min(1, "Le nom est requis."),
});

export type BaseSchemaType = z.infer<typeof baseSchema>;