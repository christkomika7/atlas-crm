import * as z from "zod";

export const citySchema = z.object({
    name: z.string().min(1, {
        message: "Le nom de la ville est requis."
    }),
    companyId: z.string().min(1, {
        message: "L'identifiant de l'entreprise est requis."
    })
});

export type CitySchemaType = z.infer<typeof citySchema>;