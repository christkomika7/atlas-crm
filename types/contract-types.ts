import { $Enums } from "@/lib/generated/prisma";
import { ClientType } from "./client.types";
import { CompanyType } from "./company.types";
import { InvoiceType } from "./invoice.types";
import { SupplierType } from "./supplier.types";
import { BillboardType } from "./billboard.types";

export type ClientContractType = {
    id: string;
    type: $Enums.ContractType;
    company: CompanyType<string>;
    clientId: string;
    client: ClientType;
    invoices: InvoiceType[];
    createdAt: Date;
}

export type LessorContractType = {
    id: string;
    type: $Enums.ContractType;
    company: CompanyType<string>;
    lessorId: string;
    lessor?: SupplierType;
    billboardId: string;
    billboard: BillboardType;
    createdAt: Date;
}

export type ContractItemType = {
    id: string;
    reference: string;
    model: string;
    dim: string;
    area: string;
    site: string;
    lighting: string;
    location: string;
    delay: string;
    price: string;
    delayPrice: string;
}

export type ContractClientType = {
    id: string;
    company: string;
    legalForm: string;
    capital: string;
    rccm: string;
    nif: string;
    address: string;
    representativeName: string;
    representativeJob: string | null | undefined;
}


export type ContractCompanyType = {
    name: string;
    legalForm: string;
    capital: string;
    address: string;
    rccm: string;
    niu: string | null;
    representativeName: string;
    representativeJob: string;
    currency: string;
    country: string;
}

export type ContractType = {
    id: string,
    type: $Enums.ContractType,
    client: ContractClientType,
    company: ContractCompanyType,
    items: ContractItemType[],
    createdAt: Date,
}