export const businessSectors = [
    { id: 1, value: "agriculture", label: "Agriculture" },
    { id: 2, value: "peche", label: "Pêche" },
    { id: 3, value: "exploitation_forestiere", label: "Exploitation forestière" },
    { id: 4, value: "extraction_miniere", label: "Extraction minière" },
    { id: 5, value: "petrole_gaz", label: "Pétrole & gaz" },
    { id: 6, value: "energies_renouvelables", label: "Énergies renouvelables" },
    { id: 7, value: "alimentaire", label: "Alimentaire" },
    { id: 8, value: "agroalimentaire", label: "Agroalimentaire" },
    { id: 9, value: "textile", label: "Textile" },
    { id: 10, value: "automobile", label: "Automobile" },
    { id: 11, value: "aerospatial", label: "Aérospatial" },
    { id: 12, value: "construction", label: "Construction" },
    { id: 13, value: "chimie", label: "Chimie" },
    { id: 14, value: "materiel_informatique", label: "Matériel informatique" },
    { id: 15, value: "electronique_grand_public", label: "Électronique grand public" },
    { id: 16, value: "robotique", label: "Robotique" },
    { id: 17, value: "pharmacie", label: "Pharmacie" },
    { id: 18, value: "soins_de_sante", label: "Soins de santé" },
    { id: 19, value: "banque_assurance", label: "Banque & assurance" },
    { id: 20, value: "technologies_information", label: "Technologies de l’information" },
    { id: 21, value: "publicite_marketing", label: "Publicité & marketing" },
    { id: 22, value: "logistique_transport", label: "Logistique & transport" },
    { id: 23, value: "tourisme_hotellerie", label: "Tourisme & hôtellerie" },
    { id: 24, value: "divertissement_medias", label: "Divertissement & médias" },
    { id: 25, value: "immobilier", label: "Immobilier" },
    { id: 26, value: "services_juridiques", label: "Services juridiques" },
    { id: 27, value: "education", label: "Éducation" },
    { id: 28, value: "formation_professionnelle", label: "Formation professionnelle" },
    { id: 29, value: "nettoyage_securite", label: "Nettoyage & sécurité" },
    { id: 30, value: "services_aux_entreprises", label: "Services aux entreprises" },
];

export const discount = [
    { id: 0, value: "0%", label: "0%" },
    { id: 1, value: "5%", label: "5%" },
    { id: 2, value: "10%", label: "10%" },
    { id: 3, value: "15%", label: "15%" },
    { id: 4, value: "20%", label: "20%" },
    { id: 5, value: "25%", label: "25%" },
    { id: 6, value: "30%", label: "30%" },
    { id: 7, value: "40%", label: "40%" },
    { id: 8, value: "50%", label: "50%" },
    { id: 9, value: "75%", label: "75%" },
    { id: 10, value: "100%", label: "100%" },
];

export const rentalDurations = [
    { id: 0, value: "6_months", label: "6 mois" },
    { id: 1, value: "1_year", label: "1 an" },
    { id: 2, value: "2_years", label: "2 ans" },
    { id: 3, value: "3_years", label: "3 ans" },
    { id: 4, value: "5_years", label: "5 ans" },
]

export const paymentTerms = [
    { id: 1, value: "paiement_7_jours", label: "Paiement sous 7 jours", data: 7 },
    { id: 2, value: "paiement_15_jours", label: "Paiement sous 15 jours", data: 15 },
    { id: 3, value: "paiement_30_jours", label: "Paiement sous 30 jours", data: 30 },
    { id: 4, value: "paiement_45_jours", label: "Paiement sous 45 jours", data: 45 },
    { id: 5, value: "paiement_60_jours", label: "Paiement sous 60 jours", data: 60 },
    { id: 6, value: "paiement_90_jours", label: "Paiement sous 90 jours", data: 90 },
    { id: 7, value: "paiement_120_jours", label: "Paiement sous 120 jours", data: 120 },
];

export const priority = [
    {
        id: 1,
        color: "bg-red",
        label: "Urgent",
        value: "URGENT"
    },
    {
        id: 2,
        color: "bg-yellow-400",
        label: "Normal",
        value: "NORMAL"
    },
    {
        id: 3,
        color: "bg-blue-700",
        label: "Relax",
        value: "RELAX"
    },
];


export const status = [
    {
        id: 1,
        color: "bg-black",
        label: "À faire",
        value: "TODO"
    },
    {
        id: 2,
        color: "bg-yellow-400",
        label: "En cour",
        value: "IN_PROGRESS"
    },
    {
        id: 3,
        color: "bg-emerald-500",
        label: "Terminé",
        value: "DONE"
    },
    {
        id: 4,
        color: "bg-red",
        label: "Bloqué",
        value: "BLOCKED"
    },
]

export const productServiceCategories = [
    {
        id: 1,
        label: "Digital",
        value: "Digital"
    },
    {
        id: 2,
        label: "Branding",
        value: "Branding"
    },
    {
        id: 3,
        label: "Conception",
        value: "Conception"
    },
    {
        id: 4,
        label: "Impression",
        value: "Impression"
    },
    {
        id: 5,
        label: "Autre",
        value: "Autre"
    },

]

export const productServiceUnitTypes = [
    {
        id: 1,
        label: "Unité",
        value: "Unit"
    },
    {
        id: 2,
        label: "Heures",
        value: "Hours"
    },
    {
        id: 3,
        label: "Jours",
        value: "Days"
    },
    {
        id: 4,
        label: "Mètre carré ",
        value: "Squaremeter"
    },
]

export const productServiceItemTypes = [
    {
        id: 1,
        label: "Produit",
        value: "PRODUCT"
    },
    {
        id: 2,
        label: "Service",
        value: "SERVICE"
    },
]

export const billboardStrucutures = [
    {
        id: 1,
        label: "Propre",
        value: "clean"
    },
    {
        id: 2,
        label: "Sale",
        value: "dirty"
    },
    {
        id: 3,
        label: "Endommagé",
        value: "damaged"
    },
    {
        id: 4,
        label: "Incomplet",
        value: "incomplete"
    },
    {
        id: 5,
        label: "Repeint",
        value: "paint"
    },
]

export const generalNotes = [
    {
        id: 1,
        label: "1",
        value: "one"
    },
    {
        id: 2,
        label: "2",
        value: "two"
    },
    {
        id: 3,
        label: "3",
        value: "three"
    },
    {
        id: 4,
        label: "4",
        value: "four"
    },
    {
        id: 5,
        label: "5",
        value: "five"
    },
];

export const lessorSpaceType = [
    {
        id: 1,
        label: "Privé",
        value: "private"
    },
    {
        id: 2,
        label: "Public",
        value: "public"
    },
];

export const recurrences = [
    {
        id: 1,
        label: "Non",
        value: "no",
    },
    {
        id: 2,
        label: "Tous les jours",
        value: "day",
    },
    {
        id: 3,
        label: "Toutes les semaines",
        value: "week",
    },
    {
        id: 4,
        label: "Toutes les 2 semaines",
        value: "2-week",
    },
    {
        id: 5,
        label: "Tous les mois",
        value: "month",
    },
    {
        id: 6,
        label: "Tous les 2 mois",
        value: "2-month",
    },
    {
        id: 7,
        label: "Tous les trimestres",
        value: "quarter",
    },
    {
        id: 8,
        label: "Tous les semestres",
        value: "semester",
    },
    {
        id: 9,
        label: "Tous les ans",
        value: "year",
    },
];

export const convert = [
    {
        id: 1,
        label: "Devis",
        value: "quote"
    },
    {
        id: 2,
        label: "Bon de livraison",
        value: "delivery-note"
    },
];

export const paymentFrequency = [
    { id: 0, value: "monthly", label: "Mensuel" },
    { id: 1, value: "quarterly", label: "Trimestriel" },
    { id: 2, value: "semiannual", label: "Semestriel" },
    { id: 3, value: "annual", label: "Annuel" },
];


export const electricitySupply = [
    { id: 0, value: "yes", label: "Oui" },
    { id: 1, value: "no", label: "Non" },
];



export const acceptPayment = [
    {
        id: 1,
        label: "Espèces",
        value: "cash"
    },
    {
        id: 2,
        label: "Chèque",
        value: "check"
    },
    {
        id: 3,
        label: "Virement",
        value: "bank-transfer"
    },
]


export const lights = [
    {
        id: 1,
        label: "Filaire",
        value: "Filaire"
    },
    {
        id: 2,
        label: "Solaire",
        value: "Solaire"
    },
    {
        id: 3,
        label: "Non éclairé",
        value: "Non éclairé"
    },
]

export const reportTypes = [
    { id: 2, value: "salesByClient", label: "Ventes par client " },
    { id: 3, value: "salesByItem", label: "Ventes par produit|service" },
    { id: 4, value: "salesByBillboards", label: "Ventes par panneaux publicitaires" },
    { id: 5, value: "paymentsByDate", label: "Paiements par date" },
    { id: 6, value: "paymentsByClients", label: "Paiements par clients" },
    { id: 7, value: "paymentsByType", label: "Paiements par type" },
    { id: 8, value: "expensesByCategories", label: "Dépenses par catégories" },
    { id: 9, value: "expensesJournal", label: "Journal des dépenses" },
    { id: 10, value: "debtorAccountAging", label: "Âge des comptes débiteurs" },
];

export const periods = [
    { id: 1, value: "currentFiscalYear", label: "Exercice fiscal en cours" },
    { id: 2, value: "currentQuarter", label: "Trimestre en cours" },
    { id: 3, value: "currentMonth", label: "Mois en cours" },
    { id: 4, value: "previousMonth", label: "Mois précédent" },
    { id: 5, value: "previousYear", label: "Année précédente" },
    { id: 6, value: "custom", label: "Personnalisé" },
];

export const movements = [
    { id: 1, value: "INFLOWS", label: "Entrée" },
    { id: 2, value: "OUTFLOWS", label: "Sortie" },
]
