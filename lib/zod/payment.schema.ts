import { z } from "zod";

export const paymentSchema = z.object({
  isPaid: z.boolean(),
  amount: z.number({ error: "Le montant  est requis." }),
  mode: z.string({ error: "Le mode de paiement est requis." }),
  date: z.date({ error: "La date du paiement est requise." }),
  information: z.string().optional(),
});


export type PaymentSchemaType = z.infer<typeof paymentSchema>;