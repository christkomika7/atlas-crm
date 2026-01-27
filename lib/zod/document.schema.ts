import { z } from "zod";

export const documentSchema = z.object({
    companyId: z.string(),
    quotes: z
        .object({
            prefix: z.string().optional(),
            notes: z.string().optional(),
        })
        .optional(),
    invoices: z
        .object({
            prefix: z.string().optional(),
            notes: z.string().optional(),
        })
        .optional(),
    deliveryNotes: z
        .object({
            prefix: z.string().optional(),
            notes: z.string().optional(),
        })
        .optional(),
    purchaseOrders: z
        .object({
            prefix: z.string().optional(),
            notes: z.string().optional(),
        })
        .optional(),

    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    position: z.string().optional(),
    size: z.string().optional(),

    logo: z
        .instanceof(File, {
            message: "Le fichier du logo est requis et doit être une image.",
        })
        .optional(),
    documents: z
        .array(
            z
                .instanceof(File)
                .refine((file) => file.type === "application/pdf", {
                    message: "Seuls les fichiers PDF sont autorisés.",
                })
        )
        .optional(),

});

export type DocumentSchemaType = z.infer<typeof documentSchema>;
