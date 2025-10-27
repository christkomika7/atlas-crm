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
    company: CompanyType<undefined>
}

export type ClientsTableHandle = {
    refetchClients: () => void;
};