import { z } from "zod";

export const receiptSchema = z.object({
    companyId: z.string({ error: "L'ID de l'entreprise est requis." }),
    reference: z.number({ error: "La référence est requise." }),
    date: z.date({ error: "La date est requise." }),
    moov: z.string({ error: "Le moov est requis." }),
    category: z.string({ error: "La catégorie est requise." }),
    nature: z.string({ error: "La nature est requise." }),
    description: z.string().optional(),
    amount: z.string({ error: "Le montant est requis." }),
    amountType: z.enum(["HT", "TTC"], { message: "Le type de montant est requis." }),
    paymentMode: z.string({ error: "Le mode de paiement est requis." }),
    checkNumber: z.string({ error: "Le numéro de chèque est requis." }),
    documentRef: z.string({ error: "La référence du document est requise." }),
    source: z.string({ error: "La source est requise." }),
    comment: z.string().optional()
});


export type ReceiptSchemaType = z.infer<typeof receiptSchema>;