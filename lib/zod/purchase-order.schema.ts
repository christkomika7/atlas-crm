import Decimal from "decimal.js";
import { z } from "zod";
import { itemPurchaseOrderSchema } from "./item.schema";

export const purchaseOrderSchema = z
    .object({
        supplierId: z.string({ error: "Le fournisseur est requis" }),
        projectId: z.string().optional(),
        companyId: z.string({ error: "L'entreprise est requise" }),
        purchaseOrderNumber: z.number({ error: "Le numéro de la facture est obligatoire." }),
        item: z.object({
            productServices: z.array(itemPurchaseOrderSchema).optional(),
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

            (!data.item || data.item.productServices && data.item.productServices.length > 0),
        {
            message:
                "Vous devez sélectionner au moins un produit/service",
            path: ["item"],
        }
    )

export const purchaseOrderUpdateSchema = z
    .object({
        id: z.string({ error: "L'identifiant est requis" }),
        supplierId: z.string({ error: "Le fournisseur est requis" }),
        projectId: z.string().optional(),
        companyId: z.string({ error: "L'entreprise est requise" }),
        purchaseOrderNumber: z.number({ error: "Le numéro de facture est requis." }),
        item: z.object({
            productServices: z.array(itemPurchaseOrderSchema).optional(),
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
            (data.item.productServices && data.item.productServices.length > 0),
        {
            message:
                "Vous devez sélectionner au moins un produit/service",
            path: ["item"],
        }
    );


export type PurchaseOrderSchemaType = z.infer<typeof purchaseOrderSchema>;
export type PurchaseOrderUpdateSchemaType = z.infer<typeof purchaseOrderUpdateSchema>;
