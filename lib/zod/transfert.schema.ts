import { z } from "zod";

export const transferSchema = z.object({
    companyId: z.string({ error: "L'ID de l'entreprise est requis." }),
    date: z.date({ error: "La date est requise." }),
    amount: z.number({ error: "Le montant est requis." }),
    origin: z.string({ error: "La source est requise." }),
    destination: z.string({ error: "La source est requise." }),
    description: z.string().optional(),
    information: z.string({ error: "Le champ information est requis." }).min(20, { error: "Minimum 20 caractères sont requis." }),
});

export type TransferSchemaType = z.infer<typeof transferSchema>;