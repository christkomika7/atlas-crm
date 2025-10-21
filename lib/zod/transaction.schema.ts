import { z } from "zod";

export const categorySchema = z.object({
    name: z.string({ error: "Le nom de la catégorie est obligatoire." }),
    type: z.enum(["receipt", "dibursement"]),
    companyId: z.string({ error: "Aucune entreprise sélectionnée." })
});

export const natureSchema = z.object({
    name: z.string({ error: "Le nom de la nature est obligatoire." }),
    companyId: z.string({ error: "Aucune entreprise sélectionnée." }),
    categoryId: z.string({ error: "Aucune catégorie a été sélectionnée." })
});


export const sourceSchema = z.object({
    name: z.string({ error: "Le nom de la source est obligatoire." }),
    sourceType: z.enum(['check', "cash", "bank-transfer"]),
    companyId: z.string({ error: "Aucune entreprise sélectionnée." }),
});

export const allocationSchema = z.object({
    name: z.string({ error: "Le nom de l'allocation est obligatoire." }),
    companyId: z.string({ error: "Aucune entreprise sélectionnée." }),
    natureId: z.string({ error: "Aucune nature a été sélectionnée." })

});

export type CategorySchemaType = z.infer<typeof categorySchema>;
export type NatureSchemaType = z.infer<typeof natureSchema>;
export type SourceSchemaType = z.infer<typeof sourceSchema>;
export type AllocationSchemaType = z.infer<typeof allocationSchema>;