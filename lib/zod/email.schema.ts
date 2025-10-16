import * as z from "zod";

export const emailSchema = z.object({
    companyId: z.string().min(1, {
        message: "L'identifiant de l'entreprise est obligatoire."
    }),
    email: z.string().min(1, {
        message: "L'adresse mail du client est requis."
    }),
    message: z.string().optional(),
    contract: z.string().min(1, {
        message: "Le contrat est requis."
    })
});

export type EmailSchemaType = z.infer<typeof emailSchema>;