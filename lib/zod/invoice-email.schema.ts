import * as z from "zod";

export const invoiceEmailSchema = z.object({
    emails: z.array(z.string()).min(1, {
        message: "Au moins une adresse email est requise."
    }),
    subject: z.string().min(1, {
        message: "L'objet du mail est requis."
    }),
    message: z.string().optional(),
    file: z
        .array(z.instanceof(File))
        .optional()
});

export type InvoiceEmailSchemaType = z.infer<typeof invoiceEmailSchema>;