import * as z from "zod";

export const billboardTypeSchema = z.object({
    name: z.string().min(1, {
        message: "Le nom du type de panneau est requis."
    }),
    companyId: z.string().min(1, {
        message: "L'identifiant de l'entreprise est requis."
    })
});

export type BillboardTypeSchemaType = z.infer<typeof billboardTypeSchema>;