import { z } from "zod";



export const itemSchema = z.object({
    designation: z.string().min(1, { message: "Le nom de l'article est obligatoire." }),
    description: z.string().optional(),
    quantity: z
        .number()
        .int()
        .min(1, { message: "La quantité doit être au moins égale à 1." }),
    price: z.string().min(1, { message: "Le prix est obligatoire." }),
    updatedPrice: z.string().min(1, { message: "Le prix avec taxe et réduction est obligatoire." }),
    discount: z.string().optional(),
    discountType: z
        .enum(["purcent", "money"], {
            error: "Le type de réduction est obligatoire.",
        }),
    invoiceId: z.string().min(1, { message: "L'identifiant de la facture est obligatoire." }),

    billboardId: z.string().optional(),
    productServiceId: z.string().optional(),
});

export const editItemSchema = z.object({
    id: z.string().min(1, { message: "L'identifiant de l'article est obligatoire." }),

    name: z.string().min(1, { message: "Le nom de l'article est obligatoire." }),
    description: z.string().optional(),
    quantity: z
        .number()
        .int()
        .min(1, { message: "La quantité doit être au moins égale à 1." }),
    price: z.string().min(1, { message: "Le prix est obligatoire." }),
    discount: z.string().optional(),
    discountType: z.enum(["purcent", "money"], {
        error: "Le type de réduction est obligatoire.",
    }),
    invoiceId: z.string().min(1, { message: "L'identifiant de la facture est obligatoire." }),

    billboardId: z.string().optional(),
    productServiceId: z.string().optional(),

});

export type ItemSchemaType = z.infer<typeof itemSchema>;
export type EditItemSchemaType = z.infer<typeof editItemSchema>;
