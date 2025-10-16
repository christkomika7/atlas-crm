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

export const IMAGE_TYPES = ["jpeg", "jpg", "png", "webp"];

// PREFIX
export const INVOICE_PREFIX = "Facture";
export const QUOTE_PREFIX = "Devis";
export const PURCHASE_ORDER_PREFIX = "BC";
export const DELIVERY_NOTE_PREFIX = "BL";
