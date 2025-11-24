import { CompanyType } from "./company.types";

export type ModelDocumentType = {
    id: string;
    companyId: string;
    company: CompanyType
    logo?: string;
    position: string | null;
    size: string | null;
    primaryColor: string;
    secondaryColor: string;

    quotesPrefix: string | null;
    invoicesPrefix: string | null;
    deliveryNotesPrefix: string | null;
    purchaseOrderPrefix: string | null;

    quotesInfo: string | null;
    invoicesInfo: string | null;
    deliveryNotesInfo: string | null;
    purchaseOrderInfo: string | null;

}

export type PrefixType = {
    invoices: string;
    quotes: string;
    deliveryNotes: string;
    purchaseOrders: string;
    creditNotes: string;
}