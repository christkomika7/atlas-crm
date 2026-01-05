import { CompanyType } from "./company.types";

export type ClientType = {
    id: string;
    companyName: string;
    lastname: string;
    hasDelete: boolean;
    firstname: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    job?: string;
    legalForms: string;
    capital: string;
    path: string;
    paidAmount: string;
    due: string;
    businessSector: string;
    businessRegistrationNumber: string;
    taxIdentificationNumber: string;
    discount: string;
    paymentTerms: string;
    information: string;
    uploadDocuments: string[];
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    company: CompanyType
}

export type InvoiceRevenueType = {
    reference: string;
    echeance: {
        color: string;
        daysLeft: string;
        text: string;
        value: number;
        dayEnd: Date
    };
    statut: boolean;
    totalTTC: string;
    amountType: string;
    payee: string;
};

export type RevenueType = {
    invoices: InvoiceRevenueType[];
    initialBalance: string;
    totalTTC: string;
    totalPaid: string;
    totalDue: string;
    payableToday: string;
    delay1to30: string;
    delay31to60: string;
    delay61to90: string;
    delayOver91: string;
    client: ClientType;
    startDate: Date;
    endDate: Date;
};

export type ClientsTableHandle = {
    refetchClients: () => void;
};