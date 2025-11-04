import { z } from "zod";

export const dibursementSchema = z.object({
    companyId: z.string({ error: "L'ID de l'entreprise est requis." }),
    date: z.date({ error: "La date est requise." }),
    category: z.string({ error: "La catégorie est requise." }),
    nature: z.string({ error: "La nature est requise." }),
    description: z.string().optional(),
    amount: z.number({ error: "Le montant est requis." }),
    period: z.object({
        from: z.date(),
        to: z.date(),
    }).optional(),
    project: z.string().optional(),
    partner: z.string().optional(),
    amountType: z.enum(["HT", "TTC"], { message: "Le type de montant est requis." }),
    paymentMode: z.string({ error: "Le mode de paiement est requis." }),
    checkNumber: z.string().optional(),
    documentRef: z.string({ error: "La référence du document est requise." }).optional(),
    allocation: z.string().optional(),
    source: z.string({ error: "La source est requise." }),
    payOnBehalfOf: z.string().optional(),
    comment: z.string().optional()
});

export type DibursementSchemaType = z.infer<typeof dibursementSchema>;