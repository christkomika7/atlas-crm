import { $Enums } from '@/lib/generated/prisma';
import { z } from "zod";

export const categorySchema = z.object({
    name: z.string({ error: "Le nom de la catégorie est obligatoire." }),
    type: z.enum(["receipt", "dibursement"]),
    companyId: z.string({ error: "Aucune entreprise sélectionnée." })
});

export const fiscalObjectSchema = z.object({
    name: z.string({ error: "Le nom de l'objet est obligatoire." }),
    companyId: z.string({ error: "Aucun objet sélectionné." })
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

export const userActionSchema = z.object({
    type: z.enum($Enums.UserActionType),
    companyId: z.string({ error: "Aucune entreprise sélectionnée." }),
    natureId: z.string({ error: "Aucune nature a été sélectionnée." }),
    clientOrSupplierId: z.string({ error: "L'id du client ou du fournisseur est obligatoire." })
});

export type CategorySchemaType = z.infer<typeof categorySchema>;
export type NatureSchemaType = z.infer<typeof natureSchema>;
export type SourceSchemaType = z.infer<typeof sourceSchema>;
export type UserActionSchemaType = z.infer<typeof userActionSchema>;
export type FiscalObjectSchemaType = z.infer<typeof fiscalObjectSchema>;