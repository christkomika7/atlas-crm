import { z } from "zod";
import { userEditSchema, userSchema } from "./user.schema";
import { Decimal } from "decimal.js";

export const taxSchema = z.object({
    taxName: z.string().min(1, {
        message: "Le nom de la taxe est obligatoire."
    }),
    taxValue: z
        .array(z.string())
        .min(1, {
            message: "Au minimum une valeur de taxe doit être ajoutée.",
        })
        .refine(
            (values) =>
                values.every((val) => /^(\d+([.]\d+)?)%$/.test(val)),
            {
                message:
                    "Chaque valeur de taxe doit être un nombre (entier ou décimal) suivi du symbole '%' (ex: 10% ou 0.9%).",
            }
        ),

    taxType: z.enum(["HT", "TTC"]).default("TTC").optional(),
    cumul: z.array(z.object({
        id: z
            .number()
            .int(),
        name: z.string().min(1, {
            message: "Le nom de la taxe cumulée est obligatoire."
        }),
        check: z.boolean()
    })).optional(),
    hasApplicableToAll: z.boolean()
});

export const companySchema = z.object({
    companyName: z.string().min(1, {
        message: "Le nom de l'entreprise est obligatoire."
    }),
    country: z.string().min(1, {
        message: "Le pays est obligatoire."
    }),
    city: z.string().min(1, {
        message: "Le ville est obligatoire."
    }),
    codePostal: z.string().optional(),
    registeredAddress: z.string().min(1, {
        message: "L'adresse enregistrée est obligatoire."
    }),
    phoneNumber: z.string().min(1, {
        message: "Le numéro de téléphone est obligatoire."
    }),
    email: z.string().trim().min(1, {
        message: "L'adresse mail est obligatoire."
    }).email({
        message: "Cette adresse mail invalide."
    }),
    website: z.string().optional(),
    businessRegistrationNumber: z.string().min(1, {
        message: "Le numéro d’immatriculation (RCCM) est obligatoire."
    }),
    taxIdentificationNumber: z.string().min(1, {
        message: "Le numéro d'identification fiscale (NIF) est obligatoire."
    }),
    capitalAmount: z.string({ error: "Le montant du capital est obligatoire." }),
    vatRate: z.array(taxSchema).min(1, {
        message: "Veuillez ajouter au moins une taxe."
    }),
    currency: z.string().min(1, {
        message: "La devise est obligatoire."
    }),
    employees: z.array(userSchema).min(1,
        { message: "Veuillez ajouter au moins un employé." }),
    fiscal: z.object({
        from: z.date(),
        to: z.date(),
    }).refine(
        (data) => new Date(data.from) <= new Date(data.to),
        { message: "La date de début doit être antérieure à la date de fin.", path: ["end"] }
    ),
    bankAccountDetails: z.string().min(1, {
        message: "Les coordonnées bancaires sont obligatoires."
    }),
    businessActivityType: z.string().min(1, {
        message: "Le secteur d'activité est obligatoire."
    }),
});

export const editCompanySchema = z.object({
    id: z.string().optional(),
    companyName: z.string().min(1, {
        message: "Le nom de l'entreprise est obligatoire."
    }),
    country: z.string().min(1, {
        message: "Le pays est obligatoire."
    }),
    city: z.string().min(1, {
        message: "Le ville est obligatoire."
    }),
    codePostal: z.string().optional(),
    registeredAddress: z.string().min(1, {
        message: "L'adresse enregistrée est obligatoire."
    }),
    phoneNumber: z.string().min(1, {
        message: "Le numéro de téléphone est obligatoire."
    }),
    email: z.string().trim().min(1, {
        message: "L'adresse mail est obligatoire."
    }).email({
        message: "Cette adresse mail invalide."
    }),
    website: z.string().optional(),
    businessRegistrationNumber: z.string().min(1, {
        message: "Le numéro d’immatriculation (RCCM) est obligatoire."
    }),
    taxIdentificationNumber: z.string().min(1, {
        message: "Le numéro d'identification fiscale (NIF) est obligatoire."
    }),
    capitalAmount: z.string({ error: "Le montant du capital est obligatoire." }),
    vatRate: z.array(taxSchema).min(1, {
        message: "Veuillez ajouter au moins une taxe."
    }),
    currency: z.string().min(1, {
        message: "La devise est obligatoire."
    }),
    employees: z.array(userEditSchema).min(1,
        { message: "Veuillez ajouter au moins un employé." }),
    fiscal: z.object({
        from: z.date(),
        to: z.date(),
    }).refine(
        (data) => new Date(data.from) <= new Date(data.to),
        { message: "La date de début doit être antérieure à la date de fin.", path: ["end"] }
    ),
    bankAccountDetails: z.string().min(1, {
        message: "Les coordonnées bancaires sont obligatoires."
    }),
    businessActivityType: z.string().min(1, {
        message: "Le secteur d'activité est obligatoire."
    }),
});


export type CompanySchemaType = z.infer<typeof companySchema>;
export type EditCompanySchemaType = z.infer<typeof editCompanySchema>;
export type TaxSchemaType = z.infer<typeof taxSchema>;