import { Decimal } from "decimal.js";
import { z } from "zod";

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
    lessorCustomer: z.string().optional(),

    lessorName: z.string().optional(),
    lessorAddress: z.string().optional(),
    lessorCity: z.string().optional(),
    lessorPhone: z.string().optional(),
    lessorEmail: z.string().optional(),
    capital: z.instanceof(Decimal, { error: "La valeur inserer est invalide" }).optional(),
    rccm: z.string().optional(),
    taxIdentificationNumber: z.string().optional(),
    legalForms: z.string().optional(),
    niu: z.string().optional(),
    rib: z.string().optional(),
    iban: z.string().optional(),
    bicSwift: z.string().optional(),
    bankName: z.string().optional(),

    representativeFirstName: z.string().optional(),
    representativeLastName: z.string().optional(),
    representativeJob: z.string().optional(),
    representativePhone: z.string().optional(),
    representativeEmail: z.string().optional(),


    rentalStartDate: z.date().optional(),
    rentalPeriod: z.string().optional(),
    paymentMode: z.array(z.string()).optional(),
    paymentFrequency: z.string().optional(),
    electricitySupply: z.string().optional(),
    specificCondition: z.string().optional(),

});

// ensuite on rend conditionnellement obligatoire si espace public
export const lessorSchema = lessorSchemaBase
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorName,
        { message: "Le nom du bailleur est requis.", path: ["lessorName"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorAddress,
        { message: "L'adresse est requise.", path: ["lessorAddress"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorCity,
        { message: "La ville est requise.", path: ["lessorCity"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorPhone,
        { message: "Le téléphone est requis.", path: ["lessorPhone"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorEmail,
        { message: "L'adresse e-mail est requise.", path: ["lessorEmail"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || data.capital !== undefined,
        { message: "Le capital est requis pour un espace public.", path: ["capital"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.rccm,
        { message: "Le RCCM est requis pour un espace public.", path: ["rccm"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.taxIdentificationNumber,
        { message: "Le numéro d'identification fiscale est requis pour un espace public.", path: ["taxIdentificationNumber"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.legalForms,
        { message: "Le statut juridique est requis pour un espace public.", path: ["legalForms"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.rib,
        { message: "Le RIB est requis.", path: ["rib"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorAddress,
        { message: "L'adresse du bailleur est requise pour un espace public.", path: ["lessorAddress"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.iban,
        { message: "L'IBAN est requise.", path: ["iban"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.bicSwift,
        { message: "LE BIC/SWIFT est requise.", path: ["bicSwift"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.bankName,
        { message: "Le nom de la banque est requis.", path: ["bankName"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativeLastName,
        { message: "Le nom du représentant est requis.", path: ["representativeLastName"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativeFirstName,
        { message: "Le prénom du représentant est requis.", path: ["representativeFirstName"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativeJob,
        { message: "Le poste du représentant est requis.", path: ["representativeJob"] }

    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativePhone,
        { message: "Le numéro de téléphone du représentant est requis.", path: ["representativePhone"] }

    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativeEmail,
        { message: "L'adresse mail du représentant est requis.", path: ["representativeEmail"] }

    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.rentalStartDate,
        { message: "La date de début de la location est requise.", path: ["rentalStartDate"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.rentalPeriod,
        { message: "Les infos de contact du représentant sont requises pour un espace public.", path: ["rentalPeriod"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.rentalPeriod,
        { message: "La durée de la location est requise.", path: ["rentalPeriod"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.paymentMode,
        { message: "Le mode de paiement est requis.", path: ["paymentMode"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.paymentFrequency,
        { message: "La fréquence de paiement est requise.", path: ["paymentFrequency"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.electricitySupply,
        { message: "Fourniture du courant requis.", path: ["electricitySupply"] }
    ).refine(
        (data) => data.lessorSpaceType !== "public" || !!data.lessorCustomer,
        { message: "Le bailleur est requis pour un espace public.", path: ["lessorCustomer"] }
    );


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
    lessorPhone: "Numéro de téléphone du bailleur",
    lessorEmail: "Adresse mail du bailleur",
    capital: "Capital du bailleur",
    rccm: "Registre du commerce (RCCM)",
    taxIdentificationNumber: "Numéro d'identification fiscale",
    niu: "NIU",
    legalForms: "Statut juridique",
    rib: "RIB",
    iban: "IBAN",
    bicSwift: "BIC/SWIFT",
    bankName: "Nom de la banque",
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