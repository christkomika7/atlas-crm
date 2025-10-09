import * as z from "zod";

export const recordEmailSchema = z.object({
    companyId: z.string({ error: "Aucune entreprise troivée." }),
    recordId: z.string({ error: "La facture est obligatoire." }),
    emails: z.array(z.string()).min(1, {
        message: "Au moins une adresse email est requise."
    }),
    subject: z.string().optional(),
    message: z.string().optional(),
    file: z
        .array(z.instanceof(File))
        .optional(),
    blob: z.instanceof(Blob, {
        error: "Le fichier à envoyer est obligatoire."
    })
});

export type RecordEmailSchemaType = z.infer<typeof recordEmailSchema>;