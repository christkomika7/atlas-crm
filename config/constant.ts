const LIMIT_FILE_SIZE = 1000;

export const LIMIT_FILE = 21;

export const MAX_FILE_SIZE = (LIMIT_FILE_SIZE * 1024 * 1024);

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/octet-stream"];

export const ACCEPTED_FILES_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'image/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

export type IMAGE_TYPES = "image/jpeg" | "image/jpg" | "image/png" | "image/webp" | "application/octet-stream";

export const SEARCH_DEBOUND = 800 as const;
export const DEFAULT_PAGE_SIZE = 1000 as const;
export const NOTIFICATION_PAGE_SIZE = 1000 as const;

export const IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];

// TRANSACTION
export const TRANSACTION_CATEGORIES = ["Règlement loyer", "Règlement salaire", "Règlement prestation de service"]
export const RECEIPT_CATEGORY = ["Règlement client"]
export const DIBURSMENT_CATEGORY = ["Règlement fournisseur"]
export const ADMINISTRATION_CATEGORY = "Administration";
export const FISCAL_NATURE = "Fiscal";
export const FISCAL_OBJECT = "TVA"

// PREFIX
export const INVOICE_PREFIX = "Facture";
export const QUOTE_PREFIX = "Devis";
export const PURCHASE_ORDER_PREFIX = "BC";
export const DELIVERY_NOTE_PREFIX = "BL";

// CHART
export const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const MAX_BARS = 12;


// LESSOR TYPE
export const CITY_ALL = "Mairie";
export const MORAL_COMPANY = "Personne morale"
export const PHYSICAL_COMPANY = "Personne physique"
