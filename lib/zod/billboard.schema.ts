import { z } from "zod";

export const billboardSchema = z.object({
    companyId: z.string().min(1, {
        message: "L'identifiant de l'entreprise est requis."
    }),

    // Section General Information
    reference: z.string().min(1, { message: "La référence unique du panneau publicitaire est requise." }),
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
    visibility: z.string().min(1, {
        message: "La visibilité du panneau publicitaire est requise.",
    }),

    // Section Photos and Brochure
    rentalPrice: z.string().min(1, {
        message: "Le prix de location du panneau publicitaire (hors TVA) est requis.",
    })
        .regex(/^[0-9\s]+$/, "Le prix doit contenir uniquement des chiffres et des espaces."),

    installationCost: z.string().min(1, {
        message: "Le coût d'installation est requis.",
    })
        .regex(/^[0-9\s]+$/, "Le coût d'installation doit contenir uniquement des chiffres et des espaces."),

    maintenance: z.string().min(1, {
        message: "L'entretien requis pour le panneau publicitaire est nécessaire.",
    })
        .regex(/^[0-9\s]+$/, "L'entretien doit contenir uniquement des chiffres et des espaces."),
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

export const lessorSchema = z.object({
    // Section Lessor Information
    lessorType: z.string().min(1, {
        message: "Le type de bailleur est requis.",
    }),
    lessorName: z.string().min(1, {
        message: "Le nom du bailleur (personne physique ou morale) est requis.",
    }),
    lessorEmail: z.string().email().min(1, {
        message: "L'adresse mail  du bailleur est requis.",
    }),
    lessorPhone: z.string().min(1, {
        message: "Le numéro de téléphone du bailleur est requis.",
    }),
    lessorJob: z.string().min(1, {
        message: "Le poste du bailleur est requis.",
    }),

    capital: z.string().min(1, {
        message: "Le capital du bailleur est requis.",
    })
        .regex(/^[0-9\s]+$/, "Le prix doit contenir uniquement des chiffres et des espaces."),
    rccm: z.string().min(1, {
        message: "Le registre du commerce (RCCM) est requis.",
    }),
    taxIdentificationNumber: z.string().min(1, {
        message: "Le numéro d'identification fiscale du bailleur est requis, si applicable.",
    }),
    lessorAddress: z.string().min(1, {
        message: "L'adresse complète du bailleur est requise.",
    }),

    // Section Legal Representative (for companies)
    representativeName: z.string().min(1, {
        message: "Le nom du représentant légal est requis.",
    }),
    representativeContract: z.string().min(1, {
        message: "Les informations de contact du représentant légal sont requises.",
    }),

    // Section Contract Details
    leasedSpace: z.string().min(1, {
        message: "Le type d'espace loué est requis.",
    }),
    contractDuration: z.object({
        from: z.date(),
        to: z.date(),
    }).optional(),
    paymentMethod: z.string().min(1, {
        message: "Les méthodes de paiement acceptées sont requises.",
    }),
    specificCondition: z.string().min(1, {
        message: "Les conditions spécifiques ou restrictions du contrat sont requises.",
    }),

    // Section Supporting Documents
    signedLeaseContract: z
        .array(z.instanceof(File).refine((file) => file.type === 'application/pdf', {
            message: "Le contrat de location signé doit être un fichier PDF.",
        }))
        .optional(),
    files: z
        .array(z.instanceof(File).refine((file) => file.type === 'application/pdf' || file.type.startsWith('image/'), {
            message: "Seuls les fichiers image ou PDF sont acceptés.",
        }))
        .optional(),
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
        message: "L'identifiant de l'entreprise est requis.",
    }),

    // Section General Information
    reference: z.string().min(1, {
        message: "La référence unique du panneau publicitaire est requise.",
    }),
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
    visibility: z.string().min(1, {
        message: "La visibilité du panneau publicitaire est requise.",
    }),
    rentalPrice: z.string().min(1, {
        message: "Le prix de location du panneau publicitaire (hors TVA) est requis.",
    })
        .regex(/^[0-9\s]+$/, "Le prix doit contenir uniquement des chiffres et des espaces."),

    installationCost: z.string().min(1, {
        message: "Le coût d'installation est requis.",
    })
        .regex(/^[0-9\s]+$/, "Le coût d'installation doit contenir uniquement des chiffres et des espaces."),

    maintenance: z.string().min(1, {
        message: "L'entretien requis pour le panneau publicitaire est nécessaire.",
    })
        .regex(/^[0-9\s]+$/, "L'entretien doit contenir uniquement des chiffres et des espaces."),
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

export const editLessorSchema = z.object({
    // Section Lessor Information
    lessorType: z.string().min(1, {
        message: "Le type de bailleur est requis.",
    }),
    lessorName: z.string().min(1, {
        message: "Le nom du bailleur (personne physique ou morale) est requis.",
    }),
    lessorEmail: z.string().email().min(1, {
        message: "L'adresse mail  du bailleur est requis.",
    }),
    lessorPhone: z.string().min(1, {
        message: "Le numéro de téléphone du bailleur est requis.",
    }),
    lessorJob: z.string().min(1, {
        message: "Le poste du bailleur est requis.",
    }),
    capital: z.string().min(1, {
        message: "Le capital du bailleur est requis.",
    }).regex(/^[0-9\s]+$/, "Le prix doit contenir uniquement des chiffres et des espaces."),
    rccm: z.string({
        message: "Le registre du commerce (RCCM) est requis, si applicable.",
    }),
    taxIdentificationNumber: z.string().min(1, {
        message: "Le numéro d'identification fiscale du bailleur est requis, si applicable.",
    }),
    lessorAddress: z.string().min(1, {
        message: "L'adresse complète du bailleur est requise.",
    }),

    // Section Legal Representative (for companies)
    representativeName: z.string().min(1, {
        message: "Le nom du représentant légal est requis.",
    }),
    representativeContract: z.string().min(1, {
        message: "Les informations de contact du représentant légal sont requises.",
    }),

    // Section Contract Details
    leasedSpace: z.string().min(1, {
        message: "Le type d'espace loué est requis.",
    }),
    contractDuration: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }).optional(),
    paymentMethod: z.string().min(1, {
        message: "Les méthodes de paiement acceptées sont requises.",
    }),
    specificCondition: z.string().min(1, {
        message: "Les conditions spécifiques ou restrictions du contrat sont requises.",
    }),

    // Section Supporting Documents
    signedLeaseContract: z
        .array(z.instanceof(File).refine((file) => file.type === 'application/pdf', {
            message: "Le contrat de location signé doit être un fichier PDF.",
        }))
        .optional(),
    files: z
        .array(z.instanceof(File).refine((file) => file.type === 'application/pdf' || file.type.startsWith('image/'), {
            message: "Seuls les fichiers image ou PDF sont acceptés.",
        }))
        .optional(),

    lastSignedLeaseContract: z.array(z.string()).optional(),
    lastFiles: z.array(z.string()).optional()
})

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
    placement: "Placement du panneau ",
    orientation: "Orientation du panneau ",
    information: "Informations supplémentaires",
    locationDuration: "Durée de location",
    address: "Adresse du panneau ",
    gmaps: "Lien Google Maps",
    zone: "Zone du panneau ",
    visibility: "Visibilité du panneau ",
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
