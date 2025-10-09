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
        .refine(
            (file) =>
                ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
            {
                message: "Le fichier doit être une image PNG ou JPEG.",
            }
        ),
});

export type DocumentSchemaType = z.infer<typeof documentSchema>;
