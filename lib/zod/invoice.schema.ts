import { z } from "zod";

export const itemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: "Le nom de l'article est obligatoire." }),
    description: z.string().optional(),
    quantity: z
        .number({ error: "La quantité doit être au moins égale à 1." }),
    locationStart: z.date(),
    locationEnd: z.date(),
    status: z.enum(["available", "non-available"]).optional(),
    price: z.string().min(1, { message: "Le prix est obligatoire." }),
    updatedPrice: z.string().min(1, { message: "Le prix avec taxe et réduction est obligatoire." }),
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
);;

export const invoiceSchema = z
    .object({
        clientId: z.string({ error: "Le client est requis" }),
        projectId: z.string({ error: "Le projet est requis" }),
        companyId: z.string({ error: "L'entreprise est requise" }),
        item: z.object({
            productServices: z.array(itemSchema).optional(),
            billboards: z.array(itemSchema).optional(),
        }, { error: "Vous devez sélectionner au moins un produit/service ou un panneau publicitaire" }),
        paymentLimit: z.string({ error: "La condition de paiement est obligatoire." }),
        files: z.array(z.instanceof(File)).optional(),
        totalHT: z.string().min(1, {
            message: "Le prix total hors taxe est requis.",
        }),
        discount: z.string().optional(),
        discountType: z.enum(["purcent", "money"], {
            message: "Le type de réduction est obligatoire.",
        }),
        totalTTC: z.string().min(1, {
            message: "Le prix total TTC est requis.",
        }),
        payee: z.string().optional(),
        note: z.string().optional(),
    })
    .refine(
        (data) =>

            (!data.item || data.item.productServices && data.item.productServices.length > 0) ||
            (data.item.billboards && data.item.billboards.length > 0),

        {
            message:
                "Vous devez sélectionner au moins un produit/service ou un panneau publicitaire",
            path: ["item"],
        }
    ).refine(
        (data) => {
            if (!data.item?.billboards) return true;

            return data.item.billboards.every((billboard) => {
                if (
                    billboard.status === "non-available" &&
                    billboard.itemType === "billboard"
                ) {
                    return billboard.locationStart !== undefined && billboard.locationEnd !== undefined;
                }
                return true;
            });
        },
        {
            message: "Veuillez insérer la date de location pour les panneaux non disponibles.",
            path: ["item"],
        }
    );

export const invoiceUpdateSchema = z
    .object({
        id: z.string({ error: "L'identifiant est requis" }),
        clientId: z.string({ error: "Le client est requis" }),
        projectId: z.string({ error: "Le projet est requis" }),
        companyId: z.string({ error: "L'entreprise est requise" }),
        invoiceNumber: z.number().min(1, { message: "Le numéro de facture est requis" }),
        item: z.object({
            productServices: z.array(itemSchema).optional(),
            billboards: z.array(itemSchema).optional(),
        }, { error: "Vous devez sélectionner au moins un produit/service ou un panneau publicitaire" }),
        files: z
            .array(z.instanceof(File))
            .optional(),
        lastUploadFiles: z.array(z.string()).optional(),
        paymentLimit: z.string({ error: "La condition de paiement est obligatoire." }),
        totalHT: z.string().min(1, {
            message: "Le prix total hors taxe est requis."
        }),
        discount: z.string().optional(),
        discountType: z
            .enum(["purcent", "money"], {
                error: "Le type de réduction est obligatoire.",
            }),
        totalTTC: z.string().min(1, {
            message: "Le prix total TTC est requis."
        }),
        payee: z.string().optional(),
        note: z.string().optional(),
    })
    .refine(
        (data) =>
            (data.item.productServices && data.item.productServices.length > 0) ||
            (data.item.billboards && data.item.billboards.length > 0),
        {
            message:
                "Vous devez sélectionner au moins un produit/service ou un panneau publicitaire",
            path: ["item"],
        }
    ).refine(
        (data) => {
            if (!data.item?.billboards) return true;

            return data.item.billboards.every((billboard) => {
                if (
                    billboard.status === "non-available" &&
                    billboard.itemType === "billboard"
                ) {
                    return billboard.locationStart !== undefined && billboard.locationEnd !== undefined;
                }
                return true;
            });
        },
        {
            message: "Veuillez insérer la date de location pour les panneaux non disponibles.",
            path: ["item"],
        }
    );;
export type InvoiceSchemaType = z.infer<typeof invoiceSchema>;
export type InvoiceUpdateSchemaType = z.infer<typeof invoiceUpdateSchema>;
