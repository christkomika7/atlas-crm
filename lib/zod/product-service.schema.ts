import { z } from "zod";

export const productServiceSchema = z.object({
    companyId: z
        .string({
            error: "L'identifiant de l'entreprise est requis.",
        })
        .min(1, "L'identifiant de l'entreprise ne peut pas être vide."),
    itemType: z.enum(["PRODUCT", "SERVICE"], {
        error: "Le type d’élément est requis.",
    }),
    reference: z
        .string({
            error: "La référence est requise.",
        })
        .min(1, "La référence ne peut pas être vide."),
    hasTax: z.boolean(),
    category: z
        .string({
            error: "La catégorie est requise.",
        })
        .min(1, "La catégorie ne peut pas être vide."),

    designation: z
        .string({
            error: "La désignation est requise.",
        })
        .min(1, "La désignation ne peut pas être vide."),

    description: z
        .string()
        .optional(),

    unitPrice: z
        .string({
            error: "Le prix unitaire est requis.",
        })
        .refine((val) => val === undefined || val.trim() === "" || !isNaN(Number(val)), {
            message: "Le prix unitaire doit être un nombre valide.",
        }),

    cost: z
        .string({
            error: "Le coût est requis.",
        })
        .min(1, "Le coût ne peut pas être vide.")
        .refine((val) => !isNaN(Number(val)), {
            message: "Le coût doit être un nombre valide.",
        }),

    quantity: z
        .string({
            error: "La quantité est requise.",
        })
        .min(1, "La quantité ne peut pas être vide.")
        .refine((val) => !isNaN(Number(val)), {
            message: "La quantité doit être un nombre valide.",
        }),

    unitType: z
        .string({
            error: "Le type d’unité est requis.",
        })
        .min(1, "Le type d’unité ne peut pas être vide."),
});

export const editProductServiceSchema = z.object({
    id: z
        .string({
            error: "L'identifiant est requis.",
        })
        .min(1, "L'identifiant ne peut pas être vide."),
    companyId: z
        .string({
            error: "L'identifiant de l'entreprise est requis.",
        })
        .min(1, "L'identifiant de l'entreprise ne peut pas être vide."),
    itemType: z.enum(["PRODUCT", "SERVICE"], {
        error: "Le type d’élément est requis.",
    }),
    hasTax: z.boolean(),
    reference: z
        .string({
            error: "La référence est requise.",
        })
        .min(1, "La référence ne peut pas être vide."),

    category: z
        .string({
            error: "La catégorie est requise.",
        }),
    designation: z
        .string({
            error: "La désignation est requise.",
        }),
    description: z
        .string()
        .optional(),

    unitPrice: z
        .string({
            error: "Le prix unitaire est requis.",
        })
        .refine((val) => val === undefined || val.trim() === "" || !isNaN(Number(val)), {
            message: "Le prix unitaire doit être un nombre valide.",
        })
        .optional(),

    cost: z
        .string({
            error: "Le coût est requis.",
        })
        .min(1, "Le coût ne peut pas être vide.")
        .refine((val) => !isNaN(Number(val)), {
            message: "Le coût doit être un nombre valide.",
        }),

    quantity: z
        .string({
            error: "La quantité est requise.",
        })
        .min(1, "La quantité ne peut pas être vide.")
        .refine((val) => !isNaN(Number(val)), {
            message: "La quantité doit être un nombre valide.",
        }),

    unitType: z
        .string({
            error: "Le type d’unité est requis.",
        })
        .min(1, "Le type d’unité ne peut pas être vide."),
});

export type ProductServiceSchemaType = z.infer<typeof productServiceSchema>;
export type EditProductServiceSchemaType = z.infer<typeof editProductServiceSchema>;