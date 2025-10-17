import { Decimal } from "decimal.js";
import { z } from "zod";

export const billboardSchema = z.object({
    companyId: z.string().min(1, {
        message: "L'identifiant de l'entreprise est requis."
    }),

    // Section General Information
    reference: z.string().min(1, { message: "La référence unique du panneau publicitaire est requise." }),
    hasTax: z.boolean(),
    type: z.string().min(1, {
        message: "Le type du panneau publicitaire est requis.",
    }),
    name: z.string().min(1, {
        message: "Le nom du panneau publicitaire est requis.",
    }),
    dimension: z.string().min(1, {
        message: "Les dimensions du panneau publicitaire (en mètres) sont requises.",
    }),
    city: z.string().min(1, {
        message: "La ville est requis.",
    }),
    area: z.string().min(1, {
        message: "Le quartier est requis.",
    }),
    placement: z.string().min(1, {
        message: "Le placement du panneau publicitaire est requis.",
    }),
    orientation: z.string().min(1, {
        message: "L'orientation du panneau publicitaire est requise.",
    }),
    information: z.string().optional(),

    // Section Location
    address: z.string().min(1, {
        message: "L'adresse du panneau publicitaire est requise.",
    }),
    gmaps: z.string().min(1, {
        message: "Le lien Google Maps est requis.",
    }),
    zone: z.string().min(1, {
        message: "La zone du panneau publicitaire est requise.",
    }),

    // Section Photos and Brochure
    rentalPrice: z.instanceof(Decimal, { error: "Le prix de location du panneau publicitaire (hors TVA) est requis." }),
    installationCost: z.instanceof(Decimal, { error: "Le coût d'installation est requis.", }),
    maintenance: z.instanceof(Decimal, { error: "L'entretien requis pour le panneau publicitaire est nécessaire." }),
    imageFiles: z
        .array(
            z.instanceof(File).refine((file) => file.type.startsWith("image/"), {
                message: "Seuls les fichiers image sont acceptés pour les photos du panneau publicitaire.",
            })
        )
        .optional()
        .refine((files) => !files || files.length === 0 || files.every((file) => file.type.startsWith("image/")), {
            message: "Tous les fichiers doivent être des images.",
        }),
    brochureFiles: z
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

    locationDuration: z.object({
        from: z.date(),
        to: z.date(),
    }).optional(),

    // Section Technical Information
    structure: z.string().min(1, {
        message: "La structure du panneau publicitaire est requise.",
    }),
    decorativeElement: z.string().min(1, {
        message: "Les éléments décoratifs du panneau publicitaire sont requis.",
    }),
    foundations: z.string().min(1, {
        message: "Les fondations du panneau publicitaire sont requises.",
    }),
    technicalVisibility: z.string().min(1, {
        message: "La visibilité technique du panneau publicitaire est requise.",
    }),
    note: z.string().min(1, {
        message: "Des notes sur l'apparence du panneau publicitaire sont requises.",
    }),
});

export const lessorSchemaBase = z.object({
    lessorType: z.string().min(1, {
        error: "Le type de bailleur est requis.",
    }),
    lessorSpaceType: z.string({
        error: "Le type d'espace est obligatoire.",
    }),
    lessorCustomer: z.string().optional(),
    lessorName: z.string().optional(),
    lessorEmail: z.string().optional(),
    lessorPhone: z.string().optional(),
    lessorJob: z.string().optional(),
    capital: z.instanceof(Decimal, { error: "La valeur inserer est invalide" }).optional(),
    rccm: z.string().optional(),
    taxIdentificationNumber: z.string().optional(),
    lessorAddress: z.string().optional(),
    representativeName: z.string().optional(),
    representativeContract: z.string().optional(),
    leasedSpace: z.string().optional(),
    contractDuration: z
        .object({
            from: z.date(),
            to: z.date(),
        })
        .optional(),
    paymentMethod: z.string().optional(),
    specificCondition: z.string().optional(),
    signedLeaseContract: z
        .array(
            z.instanceof(File).refine((file) => file.type === "application/pdf", {
                message: "Le contrat de location signé doit être un fichier PDF.",
            })
        )
        .optional(),
    files: z
        .array(
            z
                .instanceof(File)
                .refine(
                    (file) =>
                        file.type === "application/pdf" || file.type.startsWith("image/"),
                    {
                        message: "Seuls les fichiers image ou PDF sont acceptés.",
                    }
                )
        )
        .optional(),
});

// ensuite on rend conditionnellement obligatoire si espace public
export const lessorSchema = lessorSchemaBase
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorName,
        { message: "Le nom du bailleur est requis pour un espace public.", path: ["lessorName"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorEmail,
        { message: "L'adresse e-mail est requise pour un espace public.", path: ["lessorEmail"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorPhone,
        { message: "Le téléphone est requis pour un espace public.", path: ["lessorPhone"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorJob,
        { message: "Le poste est requis pour un espace public.", path: ["lessorJob"] }
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
        (data) => data.lessorSpaceType !== "private" || !!data.lessorAddress,
        { message: "L'adresse du bailleur est requise pour un espace public.", path: ["lessorAddress"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativeName,
        { message: "Le représentant légal est requis pour un espace public.", path: ["representativeName"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativeContract,
        { message: "Les infos de contact du représentant sont requises pour un espace public.", path: ["representativeContract"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.leasedSpace,
        { message: "Le type d'espace loué est requis pour un espace public.", path: ["leasedSpace"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.paymentMethod,
        { message: "La méthode de paiement est requise pour un espace public.", path: ["paymentMethod"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.specificCondition,
        { message: "Les conditions spécifiques sont requises pour un espace public.", path: ["specificCondition"] }
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
        message: "L'identifiant de l'entreprise est requis.",
    }),

    // Section General Information
    reference: z.string().min(1, {
        message: "La référence unique du panneau publicitaire est requise.",
    }),
    hasTax: z.boolean(),
    type: z.string().min(1, {
        message: "Le type du panneau publicitaire est requis.",
    }),
    name: z.string().min(1, {
        message: "Le nom du panneau publicitaire est requis.",
    }),
    dimension: z.string().min(1, {
        message: "Les dimensions du panneau publicitaire (en mètres) sont requises.",
    }),
    city: z.string().min(1, {
        message: "La ville est requis.",
    }),
    area: z.string().min(1, {
        message: "Le quartier est requis.",
    }),
    placement: z.string().min(1, {
        message: "Le placement du panneau publicitaire est requis.",
    }),
    orientation: z.string().min(1, {
        message: "L'orientation du panneau publicitaire est requise.",
    }),
    information: z.string().optional(),

    locationDuration: z.object({
        from: z.date(),
        to: z.date(),
    }).optional(),


    // Section Location
    address: z.string().min(1, {
        message: "L'adresse du panneau publicitaire est requise.",
    }),
    gmaps: z.string().min(1, {
        message: "Le lien Google Maps est requis.",
    }),
    zone: z.string().min(1, {
        message: "La zone du panneau publicitaire est requise.",
    }),

    // Section Photos and Brochure
    rentalPrice: z.instanceof(Decimal, { error: "Le prix de location du panneau publicitaire (hors TVA) est requis." }),
    installationCost: z.instanceof(Decimal, { error: "Le coût d'installation est requis.", }),
    maintenance: z.instanceof(Decimal, { error: "L'entretien requis pour le panneau publicitaire est nécessaire." }),
    imageFiles: z
        .array(z.instanceof(File).refine((file) => file.type.startsWith('image/'), {
            message: "Seuls les fichiers image sont acceptés pour les photos du panneau publicitaire.",
        }))
        .optional(),
    brochureFiles: z
        .array(z.instanceof(File).refine((file) => file.type === 'application/pdf' || file.type.startsWith('image/'), {
            message: "Seuls les fichiers image ou PDF sont acceptés pour la brochure du panneau publicitaire.",
        }))
        .optional(),

    lastImageFiles: z.array(z.string()).optional(),
    lastBrochureFiles: z.array(z.string()).optional(),

    // Section Technical Information
    structure: z.string().min(1, {
        message: "La structure du panneau publicitaire est requise.",
    }),
    decorativeElement: z.string().min(1, {
        message: "Les éléments décoratifs du panneau publicitaire sont requis.",
    }),
    foundations: z.string().min(1, {
        message: "Les fondations du panneau publicitaire sont requises.",
    }),
    technicalVisibility: z.string().min(1, {
        message: "La visibilité technique du panneau publicitaire est requise.",
    }),
    note: z.string().min(1, {
        message: "Des notes sur l'apparence du panneau publicitaire sont requises.",
    }),
});

export const editLessorSchemaBase = z.object({
    lessorType: z.string().min(1, {
        error: "Le type de bailleur est requis.",
    }),
    lessorSpaceType: z.string({
        error: "Le type d'espace est obligatoire.",
    }),
    lessorCustomer: z.string().optional(),
    lessorName: z.string().optional(),
    lessorEmail: z.string().optional(),
    lessorPhone: z.string().optional(),
    lessorJob: z.string().optional(),
    capital: z.instanceof(Decimal, { error: "La valeur inserer est invalide" }).optional(),
    rccm: z.string().optional(),
    taxIdentificationNumber: z.string().optional(),
    lessorAddress: z.string().optional(),
    representativeName: z.string().optional(),
    representativeContract: z.string().optional(),
    leasedSpace: z.string().optional(),
    contractDuration: z
        .object({
            from: z.date(),
            to: z.date(),
        })
        .optional(),
    paymentMethod: z.string().optional(),
    specificCondition: z.string().optional(),
    signedLeaseContract: z
        .array(
            z.instanceof(File).refine((file) => file.type === "application/pdf", {
                message: "Le contrat de location signé doit être un fichier PDF.",
            })
        )
        .optional(),
    files: z
        .array(
            z
                .instanceof(File)
                .refine(
                    (file) =>
                        file.type === "application/pdf" || file.type.startsWith("image/"),
                    {
                        message: "Seuls les fichiers image ou PDF sont acceptés.",
                    }
                )
        )
        .optional(),

    lastSignedLeaseContract: z.array(z.string()).optional(),
    lastFiles: z.array(z.string()).optional()
})


export const editLessorSchema = editLessorSchemaBase.refine(
    (data) => data.lessorSpaceType !== "private" || !!data.lessorName,
    { message: "Le nom du bailleur est requis pour un espace public.", path: ["lessorName"] }
)
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorEmail,
        { message: "L'adresse e-mail est requise pour un espace public.", path: ["lessorEmail"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorPhone,
        { message: "Le téléphone est requis pour un espace public.", path: ["lessorPhone"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.lessorJob,
        { message: "Le poste est requis pour un espace public.", path: ["lessorJob"] }
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
        (data) => data.lessorSpaceType !== "private" || !!data.lessorAddress,
        { message: "L'adresse du bailleur est requise pour un espace public.", path: ["lessorAddress"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativeName,
        { message: "Le représentant légal est requis pour un espace public.", path: ["representativeName"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.representativeContract,
        { message: "Les infos de contact du représentant sont requises pour un espace public.", path: ["representativeContract"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.leasedSpace,
        { message: "Le type d'espace loué est requis pour un espace public.", path: ["leasedSpace"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.paymentMethod,
        { message: "La méthode de paiement est requise pour un espace public.", path: ["paymentMethod"] }
    )
    .refine(
        (data) => data.lessorSpaceType !== "private" || !!data.specificCondition,
        { message: "Les conditions spécifiques sont requises pour un espace public.", path: ["specificCondition"] }
    ).refine(
        (data) => data.lessorSpaceType !== "public" || !!data.lessorCustomer,
        { message: "Le client du bailleur est requis pour un espace public.", path: ["lessorCustomer"] }
    );

export const editBillboardFormSchema = z.object({
    billboard: editBillboardSchema,
    lessor: editLessorSchema,
});


export const billboardError = {
    id: "Identifiant du panneau",
    companyId: "Identifiant de l'entreprise",
    reference: "",
    type: "Type du panneau ",
    name: "Nom du panneau ",
    dimension: "Dimensions du panneau  (en mètres)",
    city: "Ville",
    area: "Quartier",
    placement: "Placement du panneau ",
    orientation: "Orientation du panneau ",
    information: "Informations supplémentaires",
    locationDuration: "Durée de location",
    address: "Adresse du panneau ",
    gmaps: "Lien Google Maps",
    zone: "Zone du panneau ",
    rentalPrice: "Prix de location du panneau  (hors TVA)",
    installationCost: "Coût d'installation",
    maintenance: "Entretien du panneau ",
    imageFiles: "Photos du panneau ",
    brochureFiles: "Brochure du panneau ",
    lastImageFiles: "Photos existantes du panneau",
    lastBrochureFiles: "Brochure existante du panneau",
    structure: "Structure du panneau",
    decorativeElement: "Éléments décoratifs du panneau",
    foundations: "Fondations du panneau",
    technicalVisibility: "Visibilité technique du panneau",
    note: "Notes sur l'apparence du panneau",
}

export const lessorError = {
    lessorType: "Type de bailleur",
    lessorSpaceType: "Type d'espace",
    lessorCustomer: "Aucun bailleur sélectionné",
    lessorName: "Nom du bailleur (personne physique ou morale)",
    lessorEmail: "Adresse mail du bailleur",
    lessorPhone: "Numéro de téléphone du bailleur",
    lessorJob: "Poste du bailleur",
    capital: "Capital du bailleur",
    rccm: "Registre du commerce (RCCM)",
    taxIdentificationNumber: "Numéro d'identification fiscale",
    lessorAddress: "Adresse complète du bailleur",
    representativeName: "Nom du représentant légal",
    representativeContract: "Informations de contact du représentant légal",
    leasedSpace: "Type d'espace loué",
    contractDuration: "Durée du contrat",
    paymentMethod: "Méthodes de paiement acceptées",
    specificCondition: "Conditions spécifiques ou restrictions du contrat",
    signedLeaseContract: "Contrat de location signé",
    files: "Documents justificatifs",
    lastSignedLeaseContract: "Contrat de location signé existant",
    lastFiles: "Documents justificatifs existants"
}

export type BillboardErrorType = typeof billboardError;
export type LessorErrorType = typeof lessorError;

export type BillboardSchemaType = z.infer<typeof billboardSchema>;
export type LessorSchemaType = z.infer<typeof lessorSchema>;
export type BillboardSchemaFormType = z.infer<typeof billboardFormSchema>;

export type EditBillboardSchemaType = z.infer<typeof editBillboardSchema>;
export type EditLessorSchemaType = z.infer<typeof editLessorSchema>;
export type EditBillboardSchemaFormType = z.infer<typeof editBillboardFormSchema>;