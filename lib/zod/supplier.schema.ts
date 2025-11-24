import { z } from "zod";

export const supplierSchema = z.object({
    companyName: z.string().min(1, {
        message: "Le nom de la companie est obligatoire."
    }),
    lastname: z.string().min(1, {
        message: "Le nom de famille est obligatoire."
    }),
    firstname: z.string().min(1, {
        message: "Le prénom est obligatoire."
    }),
    email: z.string().trim().min(1, {
        message: "L'adresse mail est obligatoire."
    }).email({
        message: "Cette adresse mail est invalide."
    }),
    phone: z.string().min(1, {
        message: "Le numéro de téléphone est obligatoire."
    }),
    website: z.string().optional(),
    capital: z.string().optional(),
    address: z.string().min(1, {
        message: "L'adresse enregistrée est obligatoire."
    }),
    businessSector: z.string({
        message: "Veuillez selectionner un secteur d'activité."
    }).min(1, {
        message: "Le secteur d'activité est obligatoire.",
    }),
    businessRegistrationNumber: z.string().min(1, {
        message: "Le numéro d’immatriculation (RCCM) est obligatoire."
    }),
    legalForms: z.string({ error: "Le statut juridique est obligatoire." }),
    job: z.string().optional(),
    taxIdentificationNumber: z.string().min(1, {
        message: "Le numéro d'identification fiscale (NIF) est obligatoire."
    }),
    discount: z.string({
        message: "Veuillez selectionner la réduction."
    })
        .min(1, "La réduction est obligatoire"),
    paymentTerms: z.string({
        message: "Veuillez selectionner la condition de paiement."
    }).min(1, {
        message: "La condition de paiement est obligatoire.",
    }),
    information: z.string(),
    uploadDocuments: z
        .array(z.instanceof(File))
        .optional(),
});

export const editSupplierSchema = z.object({
    id: z.string().min(1, { message: "Id obligatoire." }),
    companyName: z.string().min(1, {
        message: "Le nom de la companie est obligatoire."
    }),
    lastname: z.string().min(1, {
        message: "Le nom de famille est obligatoire."
    }),
    firstname: z.string().min(1, {
        message: "Le prénom est obligatoire."
    }),
    email: z.string().trim().min(1, {
        message: "L'adresse mail est obligatoire."
    }).email({
        message: "Cette adresse mail est invalide."
    }),
    phone: z.string().min(1, {
        message: "Le numéro de téléphone est obligatoire."
    }),
    website: z.string().optional(),
    capital: z.string().optional(),
    address: z.string().min(1, {
        message: "L'adresse enregistrée est obligatoire."
    }),
    businessSector: z.string({
        message: "Veuillez selectionner un secteur d'activité."
    }).min(1, {
        message: "Le secteur d'activité est obligatoire.",
    }),
    legalForms: z.string({ error: "Le statut juridique est obligatoire." }),
    job: z.string().optional(),
    businessRegistrationNumber: z.string().min(1, {
        message: "Le numéro d’immatriculation (RCCM) est obligatoire."
    }),
    taxIdentificationNumber: z.string().min(1, {
        message: "Le numéro d'identification fiscale (NIF) est obligatoire."
    }),
    discount: z.string({
        message: "Veuillez selectionner la réduction."
    })
        .min(1, "La réduction est obligatoire"),
    paymentTerms: z.string({
        message: "Veuillez selectionner la condition de paiement."
    }).min(1, {
        message: "La condition de paiement est obligatoire.",
    }),
    information: z.string(),
    uploadDocuments: z
        .array(z.instanceof(File))
        .optional(),
    lastUploadDocuments: z.array(z.string()).optional()
});

export type SupplierSchemaType = z.infer<typeof supplierSchema>;
export type EditSupplierSchemaType = z.infer<typeof editSupplierSchema>;