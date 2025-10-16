import { z } from "zod";

export const receiptSchema = z.object({
    companyId: z.string({ error: "L'ID de l'entreprise est requis." }),
    date: z.date({ error: "La date est requise." }),
    category: z.string({ error: "La catégorie est requise." }),
    nature: z.string({ error: "La nature est requise." }),
    description: z.string().optional(),
    amount: z.number({ error: "Le montant est requis." }),
    amountType: z.enum(["HT", "TTC"], { message: "Le type de montant est requis." }),
    paymentMode: z.string({ error: "Le mode de paiement est requis." }),
    checkNumber: z.string({ error: "Le numéro de chèque est requis." }),
    documentRef: z.string({ error: "La référence du document est requise." }),
    documentRefType: z.string({ error: "Le type de document est requis" }),
    source: z.string({ error: "La source est requise." }),
    comment: z.string().optional()
});


export type ReceiptSchemaType = z.infer<typeof receiptSchema>;