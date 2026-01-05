import { CompanyType } from "./company.types";

export type SupplierType = {
    id: string;
    companyName: string;
    lastname: string;
    firstname: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    path: string;
    paidAmount: string;
    due: string;
    job?: string;
    legalForms: string;
    capital: string;
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


export type BillboardSupplier = {
    id: string;
    type: 'lessor' | 'supplier';
    company: string;
    legalForm: string;
    capital: string;
    taxIdentificationNumber: string;
    address: string;
    representativeName: string;
    representativeJob: string | null;
}



export type PurchaseOrderRevenueType = {
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

export type SupplierRevenueType = {
    purchaseOrders: PurchaseOrderRevenueType[];
    initialBalance: string;
    totalTTC: string;
    totalPaid: string;
    totalDue: string;
    payableToday: string;
    delay1to30: string;
    delay31to60: string;
    delay61to90: string;
    delayOver91: string;
    supplier: SupplierType;
    startDate: Date;
    endDate: Date;
};

export type CustomersTableHandle = {
    refetchClients: () => void;
};
