import Decimal from "decimal.js";
import { z } from "zod";
import { itemSchema } from "./item.schema";

export const invoiceSchema = z
    .object({
        clientId: z.string({ error: "Le client est requis" }),
        projectId: z.string({ error: "Le projet est requis" }),
        companyId: z.string({ error: "L'entreprise est requise" }),
        invoiceNumber: z.number({ error: "Le numéro de la facture est obligatoire." }),
        item: z.object({
            productServices: z.array(itemSchema).optional(),
            billboards: z.array(itemSchema).optional(),
        }, { error: "Vous devez sélectionner au moins un produit/service ou un panneau publicitaire" }),
        paymentLimit: z.string({ error: "La condition de paiement est obligatoire." }),
        files: z.array(z.instanceof(File)).optional(),
        totalHT: z.instanceof(Decimal, { error: "Le prix total hors taxe est requis." }),
        totalTTC: z.instanceof(Decimal, { error: "Le prix total TTC est requis." }),
        payee: z.instanceof(Decimal).optional(),
        amountType: z.enum(['TTC', 'HT']),
        discount: z.string().optional(),
        discountType: z.enum(["purcent", "money"], {
            message: "Le type de réduction est obligatoire.",
        }),
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
        invoiceNumber: z.number({ error: "Le numéro de facture est requis." }),
        item: z.object({
            productServices: z.array(itemSchema).optional(),
            billboards: z.array(itemSchema).optional(),
        }, { error: "Vous devez sélectionner au moins un produit/service ou un panneau publicitaire" }),
        files: z
            .array(z.instanceof(File))
            .optional(),
        lastUploadFiles: z.array(z.string()).optional(),
        amountType: z.enum(['TTC', 'HT']),
        paymentLimit: z.string({ error: "La condition de paiement est obligatoire." }),
        totalHT: z.instanceof(Decimal, { error: "Le prix total hors taxe est requis." }),
        totalTTC: z.instanceof(Decimal, { error: "Le prix total TTC est requis." }),
        payee: z.instanceof(Decimal).optional(),
        discount: z.string().optional(),
        discountType: z
            .enum(["purcent", "money"], {
                error: "Le type de réduction est obligatoire.",
            }),
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
