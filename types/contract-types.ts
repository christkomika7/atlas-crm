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