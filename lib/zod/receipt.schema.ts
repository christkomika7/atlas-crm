import { z } from "zod";

export const receiptSchema = z.object({
    companyId: z.string({ error: "L'ID de l'entreprise est requis." }),
    date: z.date({ error: "La date est requise." }),
    category: z.string({ error: "La catégorie est requise." }),
    nature: z.string({ error: "La nature est requise." }),
    information: z.string({ error: "Le champ information est requis." }).min(20, { error: "Minimum 20 caractères sont requis." }),
    amount: z.number({ error: "Le montant est requis." }),
    project: z.string().optional(),
    amountType: z.enum(["HT", "TTC"], { message: "Le type de montant est requis." }),
    paymentMode: z.string({ error: "Le mode de paiement est requis." }),
    checkNumber: z.string().optional(),
    documentRef: z.string({ error: "La référence du document est requise." }).optional(),
    userAction: z.string().optional(),
    source: z.string({ error: "La source est requise." }),
});


export type ReceiptSchemaType = z.infer<typeof receiptSchema>;