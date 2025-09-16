import { z } from "zod";

export const dibursementSchema = z.object({
    companyId: z.string().min(1, { message: "L'ID de l'entreprise est requis." }),
    reference: z.string().min(1, { message: "La référence est requise." }),
    date: z.date().min(1, { message: "La date est requise." }),
    moov: z.string().min(1, { message: "Le moov est requis." }),
    category: z.string().min(1, { message: "La catégorie est requise." }),
    nature: z.string().min(1, { message: "La nature est requise." }),
    description: z.string().optional(),
    amount: z.string().min(1, { message: "Le montant est requis." }),
    amountType: z.enum(["HT", "TTC"], { message: "Le type de montant est requis." }),
    paymentMode: z.string().min(1, { message: "Le mode de paiement est requis." }),
    checkNumber: z.string().min(1, { message: "Le numéro de chèque est requis." }),
    documentRef: z.string().min(1, { message: "La référence du document est requise." }),
    allocation: z.string().min(1, { message: "L'allocation est requise." }),
    source: z.string().min(1, { message: "La source est requise." }),
    payOnBehalfOf: z.string().min(1, { message: "Le paiement pour le compte de est requis." }),
    comment: z.string().optional()
});

export type DibursementSchemaType = z.infer<typeof dibursementSchema>;