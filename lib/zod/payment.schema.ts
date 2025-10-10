import { z } from "zod";

export const paymentSchema = z.object({
  recordId: z.string({ error: "Aucun enregistrement trouvé." }),
  isPaid: z.boolean(),
  amount: z.number({ error: "Le montant  est requis." }).min(0, { message: "Les nombres négatifs ne sont pas autorisés." }),
  mode: z.string({ error: "Le mode de paiement est requis." }),
  date: z.date({ error: "La date du paiement est requise." }),
  information: z.string().optional(),
});


export type PaymentSchemaType = z.infer<typeof paymentSchema>;