import Decimal from "decimal.js";
import { z } from "zod";

export const itemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Le nom de l'article est obligatoire." }),
    description: z.string().optional(),
    quantity: z
        .number({ error: "La quantité doit être au moins égale à 1." }),
    lastQuantity: z.number().optional(),
    locationStart: z.date(),
    locationEnd: z.date(),
    price: z.instanceof(Decimal, { error: "Le prix est obligatoire." }),
    updatedPrice: z.instanceof(Decimal, { error: "Le prix avec taxe et réduction est obligatoire." }),
    discount: z.string().optional(),
    currency: z.string().optional(),
    discountType: z
        .enum(["purcent", "money"], {
            error: "Le type de réduction est obligatoire.",
        }),
    itemType: z.enum(["billboard", "product", "service"]).optional(),
    billboardId: z.string().optional(),
    productServiceId: z.string().optional(),
}).refine(
    (data) => {
        if ((data.locationStart && !data.locationEnd) || (!data.locationStart && data.locationEnd)) {
            return false;
        }
        return true;
    },
    {
        message: "Les deux dates de location (début et fin) doivent être renseignées.",
        path: ["item"],
    }
);


export const itemPurchaseOrderSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Le nom de l'article est obligatoire." }),
    description: z.string().optional(),
    quantity: z
        .number().min(1, { error: "La quantité doit être au moins égale à 1." }),
    selectedQuantity: z
        .number().min(1, { error: "La quantité doit être au moins égale à 1." }),
    status: z.enum(["available", "non-available"]).optional(),
    price: z.instanceof(Decimal, { error: "Le prix est obligatoire." }),
    updatedPrice: z.instanceof(Decimal, { error: "Le prix avec taxe et réduction est obligatoire." }),
    discount: z.string().optional(),
    currency: z.string().optional(),
    discountType: z
        .enum(["purcent", "money"], {
            error: "Le type de réduction est obligatoire.",
        }),
    itemType: z.enum(["product", "service"]).optional(),
    productServiceId: z.string().optional(),
})

export type ItemSchemaType = z.infer<typeof itemSchema>;
export type ItemPurchaseOrderSchemaType = z.infer<typeof itemPurchaseOrderSchema>;