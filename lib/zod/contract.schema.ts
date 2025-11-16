import { z } from "zod";
import { $Enums } from "../generated/prisma";

export const contractSchema = z.object({
    range: z.object({
        from: z.date(),
        to: z.date(),
    }).refine(
        (data) => new Date(data.from) <= new Date(data.to),
        { message: "La date de début doit être antérieure à la date de fin.", path: ["end"] }
    ),
    billboardType: z.array(z.string()).min(1, { message: "Le type de panneau est requis" }),
    city: z.array(z.string()).min(1, { error: "La ville est requise." }),
    area: z.array(z.string()).min(1, { message: "Au minimum une zone doit etre séléctionné." }),
});

export const clientContractSchema = z.object({
    id: z.string().optional(),
    type: z.enum($Enums.ContractType, { error: "Le type de contrat est obligatoire." }),
    company: z.string({ error: "Aucun entreprise trouvée." }),
    client: z.string({ error: "Aucun client trouvé." }),
    invoices: z.array(z.string()).min(1, { error: "Au moins une facture doit être ajouté." })
});

export const lessorContractSchema = z.object({
    id: z.string().optional(),
    type: z.enum($Enums.ContractType, { error: "Le type de contrat est obligatoire." }),
    company: z.string({ error: "Aucun entreprise trouvée." }),
    lessor: z.string({ error: 'Le fournisseur est obligatoire.' }),
    lesortType: z.string({ error: "Le type du fournisseur est obligatoire" }),
    billboard: z.string({ error: "Le panneau d'affichage est obligatoire" }),
});


export type ContractSchemaType = z.infer<typeof contractSchema>;
export type ClientContractSchemaType = z.infer<typeof clientContractSchema>;
export type LessorContractSchemaType = z.infer<typeof lessorContractSchema>;