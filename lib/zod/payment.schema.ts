import { z } from "zod";

export const invoicePaymentSchema = z.object({
  recordId: z.string({ error: "Aucun enregistrement trouvé." }),
  isPaid: z.boolean(),
  source: z.string({ error: "La source est requise." }),
  checkNumber: z.string().optional(),
  amount: z.number({ error: "Le montant  est requis." }).min(0, { message: "Les nombres négatifs ne sont pas autorisés." }),
  mode: z.string({ error: "Le mode de paiement est requis." }),
  date: z.date({ error: "La date du paiement est requise." }),
  information: z.string({ error: "Le champ information est requis." }).min(20, { error: "Minimum 20 caractères sont requis." }),
});

export const purchaseOrderPaymentSchema = z.object({
  recordId: z.string({ error: "Aucun enregistrement trouvé." }),
  isPaid: z.boolean(),
  category: z.string({ error: "La catégorie est requise." }),
  nature: z.string({ error: "La nature est requise." }),
  source: z.string({ error: "La source est requise." }),
  checkNumber: z.string().optional(),
  amount: z.number({ error: "Le montant  est requis." }).min(0, { message: "Les nombres négatifs ne sont pas autorisés." }),
  mode: z.string({ error: "Le mode de paiement est requis." }),
  date: z.date({ error: "La date du paiement est requise." }),
  information: z.string({ error: "Le champ information est requis." }).min(20, { error: "Minimum 20 caractères sont requis." }),
});



export type InvoicePaymentSchemaType = z.infer<typeof invoicePaymentSchema>;
export type PurchaseOrderPaymentSchemaType = z.infer<typeof purchaseOrderPaymentSchema>;