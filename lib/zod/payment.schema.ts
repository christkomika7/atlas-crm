import { z } from "zod";

export const paymentSchema = z.object({
  isPaid: z.boolean(),
  amount: z.string().min(1, { message: "Le montant  est requis." }),
  mode: z.string().min(1, { message: "Le mode de paiement est requis." }),
  date: z.date().min(1, { message: "La date du paiement est requise." }),
  information: z.string().optional(),
});


export type PaymentSchemaType = z.infer<typeof paymentSchema>;