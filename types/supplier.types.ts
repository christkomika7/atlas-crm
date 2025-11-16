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
    company: CompanyType<undefined>
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


export type CustomersTableHandle = {
    refetchClients: () => void;
};