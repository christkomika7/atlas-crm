import { Decimal } from "decimal.js";
import { z } from "zod";

const isPrivate = (data: any) => data.lessorSpaceType === "private";
const isPublic = (data: any) => data.lessorSpaceType === "public";
const isPerson = (data: any) => data.lessorType === "Personne physique";

function requiredForPrivate(value: any, data: any) {
    return !isPrivate(data) || !!value;
}

function requiredForPublic(value: any, data: any) {
    if (isPerson(data)) return true;
    return !isPublic(data) || !!value;
}

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

    identityCard: z.string().optional(),

    representativeFirstName: z.string().optional(),
    representativeLastName: z.string().optional(),
    representativeJob: z.string().optional(),
    representativePhone: z.string().optional(),
    representativeEmail: z.string().optional(),

    // NONE OPTIONAL IF LESSORTYPENAME !== MAIRIE
    locationPrice: z.string().optional(),
    nonLocationPrice: z.string().optional(),

    delayContract: z.object({
        from: z.date(),
        to: z.date(),
    }).optional(),
    rentalStartDate: z.date().optional(),
    rentalPeriod: z.string().optional(),
    paymentMode: z.array(z.string()).optional(),
    paymentFrequency: z.string().optional(),
    electricitySupply: z.string().optional(),
    specificCondition: z.string().optional(),

});

export const lessorSchema = lessorSchemaBase
    // ----- PRIVATE REQUIRED -----
    .refine(d => requiredForPrivate(d.lessorName, d), { message: "Le nom du bailleur est requis.", path: ["lessorName"] })
    .refine(d => requiredForPrivate(d.lessorAddress, d), { message: "L'adresse est requise.", path: ["lessorAddress"] })
    .refine(d => requiredForPrivate(d.lessorCity, d), { message: "La ville est requise.", path: ["lessorCity"] })
    .refine(d => requiredForPrivate(d.lessorPhone, d), { message: "Le téléphone est requis.", path: ["lessorPhone"] })
    .refine(d => requiredForPrivate(d.lessorEmail, d), { message: "L'adresse e-mail est requise.", path: ["lessorEmail"] })

    // ----- PUBLIC REQUIRED (sauf Personne physique) -----
    .refine(d => requiredForPublic(d.capital, d), { message: "Le capital est requis pour un espace public.", path: ["capital"] })
    .refine(d => requiredForPublic(d.rccm, d), { message: "Le RCCM est requis.", path: ["rccm"] })
    .refine(d => requiredForPublic(d.taxIdentificationNumber, d), { message: "Le numéro d'identification fiscale est requis.", path: ["taxIdentificationNumber"] })
    .refine(d => requiredForPublic(d.legalForms, d), { message: "Le statut juridique est requis.", path: ["legalForms"] })
    .refine(d => requiredForPublic(d.rib, d), { message: "Le RIB est requis.", path: ["rib"] })
    .refine(d => requiredForPublic(d.iban, d), { message: "L'IBAN est requis.", path: ["iban"] })
    .refine(d => requiredForPublic(d.bicSwift, d), { message: "Le BIC/SWIFT est requis.", path: ["bicSwift"] })
    .refine(d => requiredForPublic(d.bankName, d), { message: "Le nom de la banque est requis.", path: ["bankName"] })

    // Représentants
    .refine(d => requiredForPublic(d.representativeLastName, d), { message: "Le nom du représentant est requis.", path: ["representativeLastName"] })
    .refine(d => requiredForPublic(d.representativeFirstName, d), { message: "Le prénom du représentant est requis.", path: ["representativeFirstName"] })
    .refine(d => requiredForPublic(d.representativeJob, d), { message: "Le poste du représentant est requis.", path: ["representativeJob"] })
    .refine(d => requiredForPublic(d.representativePhone, d), { message: "Le numéro de téléphone du représentant est requis.", path: ["representativePhone"] })
    .refine(d => requiredForPublic(d.representativeEmail, d), { message: "L'email du représentant est requis.", path: ["representativeEmail"] })

    // Contrat (public sauf personne physique)
    .refine(d => requiredForPublic(d.delayContract, d), { message: "La durée du contrat est obligatoire.", path: ["delayContract"] })
    .refine(d => requiredForPublic(d.rentalStartDate, d), { message: "La date de début est requise.", path: ["rentalStartDate"] })

    // Champs public toujours obligatoires
    .refine(d => !isPublic(d) || !!d.lessorCustomer, { message: "Le bailleur est requis pour un espace public.", path: ["lessorCustomer"] })
    .refine(d => !isPublic(d) || !!d.paymentMode, { message: "Le mode de paiement est requis.", path: ["paymentMode"] })
    .refine(d => !isPublic(d) || !!d.paymentFrequency, { message: "La fréquence de paiement est requise.", path: ["paymentFrequency"] })
    .refine(d => !isPublic(d) || !!d.electricitySupply, { message: "Fourniture du courant requise.", path: ["electricitySupply"] });

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