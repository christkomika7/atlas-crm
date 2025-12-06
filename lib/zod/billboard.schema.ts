import { MORAL_COMPANY, PHYSICAL_COMPANY } from "@/config/constant";
import { Decimal } from "decimal.js";
import { z } from "zod";

const isPublic = (d: any) => d.lessorSpaceType === "public";
const isPrivate = (d: any) => d.lessorSpaceType === "private";
const isPersonMoral = (d: any) => d.lessorTypeName === MORAL_COMPANY;
const isPersonPhysique = (d: any) => d.lessorTypeName === PHYSICAL_COMPANY;

export const billboardSchema = z.object({
    companyId: z.string().min(1, {
        message: "L'identifiant de l'entreprise est requis."
    }),
    reference: z.string().min(1, { message: "La référence unique du panneau publicitaire est requise." }),
    hasTax: z.boolean(),
    type: z.string().min(1, {
        message: "Le type du panneau publicitaire est requis.",
    }),
    name: z.string().min(1, {
        message: "Le nom du panneau publicitaire est requis.",
    }),
    locality: z.string().min(1, {
        message: "Le lieu est requis.",
    }),
    area: z.string().min(1, {
        message: "Le quartier est requis.",
    }),
    visualMarker: z.string({ error: "Le repère visuel est requis." }),
    displayBoard: z.string({ error: "Le support d'affichage est requis." }),

    city: z.string({
        error: "La ville est requis.",
    }),
    orientation: z.string({
        error: "L'orientation du panneau publicitaire est requise.",
    }),
    gmaps: z.string({
        error: "Le lien Google Maps est requis.",
    }),
    photos: z
        .array(
            z.instanceof(File).refine((file) => file.type.startsWith("image/"), {
                message: "Seuls les fichiers image sont acceptés pour les photos du panneau publicitaire.",
            })
        )
        .refine((files) => !files || files.length === 0 || files.every((file) => file.type.startsWith("image/")), {
            message: "Tous les fichiers doivent être des images.",
        }),
    brochures: z
        .array(
            z
                .instanceof(File)
                .refine(
                    (file) => file.type === "application/pdf" || file.type.startsWith("image/"),
                    {
                        message:
                            "Seuls les fichiers image ou PDF sont acceptés pour la brochure du panneau publicitaire.",
                    }
                )
        )
        .refine(
            (files) =>
                !files ||
                files.length === 0 ||
                files.every(
                    (file) =>
                        file.type === "application/pdf" || file.type.startsWith("image/")
                ),
            {
                message:
                    "Tous les fichiers doivent être des images ou des PDF pour la brochure.",
            }
        ),

    rentalPrice: z.instanceof(Decimal, { error: "Le prix de location du panneau publicitaire (hors TVA) est requis." }),
    installationCost: z.instanceof(Decimal, { error: "Le coût d'installation est requis.", }).optional(),
    maintenance: z.instanceof(Decimal, { error: "L'entretien requis pour le panneau publicitaire est nécessaire." }).optional(),

    width: z.number({ error: "La largeur du panneau est requis." }),
    height: z.number({ error: "La hauteur du panneau est requis" }),
    lighting: z.string({ error: "L'éclairage est requis" }),
    structureType: z.string({ error: "Le type de structure est requis" }),
    panelCondition: z.string({ error: "L'état du panneau est requis" }),
    decorativeElement: z.string({
        error: "Les éléments décoratifs du panneau publicitaire sont requis.",
    }),
    foundations: z.string({
        error: "FOndations et visserie sont requis.",
    }),
    electricity: z.string({ error: "L'électricité et l'éclairage requis." }),
    framework: z.string({ error: "Structure et châssis est requis." }),
    note: z.string({
        error: "Des notes sur l'apparence du panneau publicitaire sont requises.",
    }),

});

export const lessorSchemaBase = z.object({
    lessorSpaceType: z.string({
        error: "Le type d'espace est obligatoire.",
    }),
    lessorType: z.string().min(1, {
        error: "Le type de bailleur est requis.",
    }),

    lessorCustomer: z.string().optional().nullable(),
    lessorTypeName: z.string().optional().nullable(),

    lessorName: z.string().optional().nullable(),
    lessorAddress: z.string().optional().nullable(),
    lessorCity: z.string().optional().nullable(),
    lessorPhone: z.string().optional().nullable(),
    lessorEmail: z.string().optional().nullable(),

    capital: z.string().optional().nullable(),
    rccm: z.string().optional().nullable(),
    taxIdentificationNumber: z.string().optional().nullable(),
    legalForms: z.string().optional().nullable(),

    niu: z.string().optional().nullable(),
    rib: z.string().optional().nullable(),
    iban: z.string().optional().nullable(),
    bicSwift: z.string().optional().nullable(),
    bankName: z.string().optional().nullable(),

    identityCard: z.string().optional().nullable(),

    representativeFirstName: z.string().optional().nullable(),
    representativeLastName: z.string().optional().nullable(),
    representativeJob: z.string().optional().nullable(),
    representativePhone: z.string().optional().nullable(),
    representativeEmail: z.string().optional().nullable(),

    locationPrice: z.string().optional().nullable(),
    nonLocationPrice: z.string().optional().nullable(),


    delayContractStart: z.string().optional().nullable(),
    delayContractEnd: z.string().optional().nullable(),

    rentalStartDate: z.string().optional().nullable(),

    rentalPeriod: z.string().optional().nullable(),
    paymentMode: z.array(z.string()).optional().nullable(),
    paymentFrequency: z.string().optional().nullable(),
    electricitySupply: z.string().optional().nullable(),
    specificCondition: z.string().optional().nullable(),

});

export const lessorSchema = lessorSchemaBase
    // ========================================
    // VALIDATIONS PUBLIC
    // ========================================
    .refine(d => !isPublic(d) || !!d.lessorCustomer, {
        path: ["lessorCustomer"],
        message: "Le bailleur est requis pour un espace public."
    })

    // ========================================
    // VALIDATIONS PRIVATE (tous les types)
    // ========================================
    .refine(d => !isPrivate(d) || !!d.locationPrice, {
        path: ["locationPrice"],
        message: "Prix requis."
    })
    .refine(d => !isPrivate(d) || !!d.nonLocationPrice, {
        path: ["nonLocationPrice"],
        message: "Prix non loué requis."
    })
    .refine(d => !isPrivate(d) || !!d.lessorName, {
        path: ["lessorName"],
        message: "Nom requis."
    })
    .refine(d => !isPrivate(d) || !!d.lessorAddress, {
        path: ["lessorAddress"],
        message: "Adresse requise."
    })
    .refine(d => !isPrivate(d) || !!d.lessorCity, {
        path: ["lessorCity"],
        message: "Ville requise."
    })
    .refine(d => !isPrivate(d) || !!d.lessorPhone, {
        path: ["lessorPhone"],
        message: "Téléphone requis."
    })
    .refine(d => !isPrivate(d) || !!d.lessorEmail, {
        path: ["lessorEmail"],
        message: "Email requis."
    })
    .refine(d => !isPrivate(d) || !!d.rib, {
        path: ["rib"],
        message: "RIB requis."
    })
    .refine(d => !isPrivate(d) || !!d.iban, {
        path: ["iban"],
        message: "IBAN requis."
    })
    .refine(d => !isPrivate(d) || !!d.bicSwift, {
        path: ["bicSwift"],
        message: "BIC requis."
    })
    .refine(d => !isPrivate(d) || !!d.bankName, {
        path: ["bankName"],
        message: "Nom banque requis."
    })
    .refine(d => !isPrivate(d) || !!d.paymentMode, {
        path: ["paymentMode"],
        message: "Mode paiement requis."
    })
    .refine(d => !isPrivate(d) || !!d.paymentFrequency, {
        path: ["paymentFrequency"],
        message: "Fréquence paiement requise."
    })
    .refine(d => !isPrivate(d) || !!d.electricitySupply, {
        path: ["electricitySupply"],
        message: "Fourniture courant requise."
    })

    // ========================================
    // VALIDATIONS PRIVATE + PERSONNE MORALE
    // ========================================
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.capital, {
        path: ["capital"],
        message: "Capital requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.rccm, {
        path: ["rccm"],
        message: "RCCM requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.taxIdentificationNumber, {
        path: ["taxIdentificationNumber"],
        message: "Numéro fiscal requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.legalForms, {
        path: ["legalForms"],
        message: "Statut juridique requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.representativeFirstName, {
        path: ["representativeFirstName"],
        message: "Prénom représentant requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.representativeLastName, {
        path: ["representativeLastName"],
        message: "Nom représentant requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.representativeJob, {
        path: ["representativeJob"],
        message: "Poste représentant requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.representativePhone, {
        path: ["representativePhone"],
        message: "Téléphone représentant requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.representativeEmail, {
        path: ["representativeEmail"],
        message: "Email représentant requis."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.rentalStartDate, {
        path: ["rentalStartDate"],
        message: "Date début requise."
    })
    .refine(d => !isPrivate(d) || !isPersonMoral(d) || !!d.rentalPeriod, {
        path: ["rentalPeriod"],
        message: "Durée requise."
    })

    // ========================================
    // VALIDATIONS PRIVATE + PERSONNE PHYSIQUE
    // ========================================
    .refine(d => !isPrivate(d) || !isPersonPhysique(d) || !!d.delayContractStart, {
        path: ["delayContractStart"],
        message: "Date du début du contrat requise."
    })
    .refine(d => !isPrivate(d) || !isPersonPhysique(d) || !!d.delayContractEnd, {
        path: ["delayContractEnd"],
        message: "Date de fin du contrat requise."
    });

export const billboardFormSchema = z.object({
    billboard: billboardSchema,
    lessor: lessorSchema,
});

export const editBillboardSchema = z.object({
    id: z.string().min(1, {
        message: "L'identifiant du panneau est requis."
    }),
    companyId: z.string().min(1, {
        message: "L'identifiant de l'entreprise est requis."
    }),
    reference: z.string().min(1, { message: "La référence unique du panneau publicitaire est requise." }),
    hasTax: z.boolean(),
    type: z.string().min(1, {
        message: "Le type du panneau publicitaire est requis.",
    }),
    name: z.string().min(1, {
        message: "Le nom du panneau publicitaire est requis.",
    }),
    locality: z.string().min(1, {
        message: "Le lieu est requis.",
    }),
    area: z.string().min(1, {
        message: "Le quartier est requis.",
    }),
    visualMarker: z.string({ error: "Le repère visuel est requis." }),
    displayBoard: z.string({ error: "Le support d'affichage est requis." }),

    city: z.string({
        error: "La ville est requis.",
    }),
    orientation: z.string({
        error: "L'orientation du panneau publicitaire est requise.",
    }),
    gmaps: z.string({
        error: "Le lien Google Maps est requis.",
    }),


    photos: z
        .array(
            z.instanceof(File).refine((file) => file.type.startsWith("image/"), {
                message: "Seuls les fichiers image sont acceptés pour les photos du panneau publicitaire.",
            })
        ).optional()
        .refine((files) => !files || files.length === 0 || files.every((file) => file.type.startsWith("image/")), {
            message: "Tous les fichiers doivent être des images.",
        }),
    brochures: z
        .array(
            z
                .instanceof(File)
                .refine(
                    (file) => file.type === "application/pdf" || file.type.startsWith("image/"),
                    {
                        message:
                            "Seuls les fichiers image ou PDF sont acceptés pour la brochure du panneau publicitaire.",
                    }
                )
        )
        .optional()
        .refine(
            (files) =>
                !files ||
                files.length === 0 ||
                files.every(
                    (file) =>
                        file.type === "application/pdf" || file.type.startsWith("image/")
                ),
            {
                message:
                    "Tous les fichiers doivent être des images ou des PDF pour la brochure.",
            }
        ),

    rentalPrice: z.instanceof(Decimal, { error: "Le prix de location du panneau publicitaire (hors TVA) est requis." }),
    installationCost: z.instanceof(Decimal, { error: "Le coût d'installation est requis.", }).optional(),
    maintenance: z.instanceof(Decimal, { error: "L'entretien requis pour le panneau publicitaire est nécessaire." }).optional(),

    width: z.number({ error: "La largeur du panneau est requis." }),
    height: z.number({ error: "La hauteur du panneau est requis" }),
    lighting: z.string({ error: "L'éclairage est requis" }),
    structureType: z.string({ error: "Le type de structure est requis" }),
    panelCondition: z.string({ error: "L'état du panneau est requis" }),
    decorativeElement: z.string({
        error: "Les éléments décoratifs du panneau publicitaire sont requis.",
    }),
    foundations: z.string({
        error: "FOndations et visserie sont requis.",
    }),
    electricity: z.string({ error: "L'électricité et l'éclairage requis." }),
    framework: z.string({ error: "Structure et châssis est requis." }),
    note: z.string({
        error: "Des notes sur l'apparence du panneau publicitaire sont requises.",
    }),
    lastPhotos: z.array(z.string()).optional(),
    lastBrochures: z.array(z.string()).optional(),
});


export const editBillboardFormSchema = z.object({
    billboard: editBillboardSchema,
    lessor: lessorSchema,
});


export const billboardError = {
    id: "Identifiant du panneau",
    companyId: "Identifiant de l'entreprise",
    reference: "La référemce du panneau",
    type: "Type du panneau ",
    name: "Nom du panneau ",
    locality: "Lieu",
    area: "Quartier",
    visualMarker: "Repère visuel",
    displayBoard: "Support d'affichage",
    city: "Ville",
    orientation: "Orientation du panneau ",
    gmaps: "Lien Google Maps",
    imageFiles: "Photos du panneau ",
    brochureFiles: "Brochure du panneau ",
    lastPhotos: "Photos existantes du panneau",
    lastBrochures: "Brochure existante du panneau",
    rentalPrice: "Prix de location du panneau  (hors TVA)",
    installationCost: "Coût d'installation",
    maintenance: "Entretien du panneau ",
    width: "Largeur",
    hauteur: "Largeur",
    lighting: "Éclairage",
    structureType: "Type de structure",
    panelCondition: "État du panneau",
    decorativeElement: "Éléments décoratifs",
    foundations: "Fondations et visserie",
    electricity: "Électricité et éclairage",
    framework: "Structure et châssis",
    note: "Notes sur l'apparence du panneau",
}

export const lessorError = {
    lessorType: "Type de bailleur",
    lessorSpaceType: "Type d'espace",
    lessorCustomer: "Aucun bailleur sélectionné",
    lessorName: "Nom du bailleur",
    lessorAddress: "Adresse du bailleur",
    lessorCity: "Ville du bailleur",
    delayContract: "Durée du contrat",
    lessorPhone: "Numéro de téléphone du bailleur",
    lessorEmail: "Adresse mail du bailleur",
    capital: "Capital du bailleur",
    rccm: "Registre du commerce (RCCM)",
    taxIdentificationNumber: "Numéro d'identification fiscale",
    locationPrice: "Prix du panneau loué",
    nonLocationPrice: "Prix du panneau non loué",
    niu: "NIU",
    legalForms: "Statut juridique",
    rib: "RIB",
    iban: "IBAN",
    bicSwift: "BIC/SWIFT",
    bankName: "Nom de la banque",
    delayContractStart: "Date du début du contrat",
    delayContractEnd: "Date de fin du contrat",
    rentalStartDate: "Date de début de la location",
    rentalPeriod: "Durée de la location",
    paymentMode: "Mode de paiement",
    representativeFirstName: "Prénom du représentant",
    representativeLastName: "Nom du représentant",
    representativeJob: "Poste du représentant",
    representativePhone: "Numéro de téléphone du représentant",
    representativeEmail: "Adresse mail du représentant",

    paymentFrequency: "Fréquence de paiement",
    electricitySupply: "Fourniture du courant",
    specificCondition: "Conditions spécifiques ou restrictions du contrat",
}

export type BillboardErrorType = typeof billboardError;
export type LessorErrorType = typeof lessorError;

export type BillboardSchemaType = z.infer<typeof billboardSchema>;
export type LessorSchemaType = z.infer<typeof lessorSchema>;
export type BillboardSchemaFormType = z.infer<typeof billboardFormSchema>;

export type EditBillboardSchemaType = z.infer<typeof editBillboardSchema>;
export type EditLessorSchemaType = z.infer<typeof lessorSchema>;
export type EditBillboardSchemaFormType = z.infer<typeof editBillboardFormSchema>;