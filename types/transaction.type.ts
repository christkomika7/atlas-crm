import { $Enums } from "@/lib/generated/prisma";
import { InvoiceType } from "./invoice.types";
import { ClientType } from "./client.types";
import { CompanyType } from "./company.types";

export type TransactionType = {
    id: string;
    type: $Enums.TransactionType,
    reference: number;
    date: Date;
    movement: $Enums.BankTransaction;

    categoryId: string;
    category: TransactionCategoryType;

    natureId: string;
    nature: TransactionNatureType;

    amount: string;
    amountType: $Enums.AmountType,

    paymentType: string;
    checkNumber: string;

    referenceInvoiceId: string;
    referenceInvoice: InvoiceType;

    allocationId: string;
    allocation: AllocationType;

    sourceId: string;
    source: SourceType;

    payOnBehalfOfId: string;
    payOnBehalfOf: ClientType;

    description: string;
    comment: string;

    companyId: string;
    company: CompanyType<string>;

    updatedAt: Date;
    createdAt: Date;
}

export type TransactionCategoryType = {
    id: string;
    name: string;
    natures: TransactionNatureType[]
}

export type TransactionNatureType = {
    id: string;
    name: string;
}

export type SourceType = {
    id: string;
    name: string;
}

export type AllocationType = {
    id: string;
    name: string;
}

export type TransactionDocument = {
    id: string;
    type: string,
    reference: string;
    price: string;
    currency: string;
}