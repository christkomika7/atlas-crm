import * as z from "zod";

export const areaSchema = z.object({
    name: z.string().min(1, {
        message: "Le nom du quartier est requis."
    }),
    companyId: z.string().min(1, {
        message: "L'identifiant de l'entreprise est requis."
    }),
    cityId: z.string().min(1, {
        message: "L'identifiant de ville est requis."
    })
});

export type AreaSchemaType = z.infer<typeof areaSchema>;