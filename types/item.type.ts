import { $Enums } from "@/lib/generated/prisma";
import { BillboardType } from "./billboard.types";
import { InvoiceType } from "./invoice.types";
import Decimal from "decimal.js";

export type OmitItemType = "state" | "billboard" | 'itemInvoiceType' | "invoiceId" | "invoice" | "createdAt" | "updatedAt";

export type ItemType = {
    id: string;
    hasTax: boolean;
    state: $Enums.ItemState,
    billboardId?: string;
    billboard: BillboardType;
    name: string;
    description?: string;
    itemInvoiceType: $Enums.ItemInvoiceType
    locationStart: Date;
    locationEnd: Date;
    quantity: number;
    price: Decimal;
    updatedPrice: Decimal;
    discount: string;
    discountType: string;
    currency: string;
    itemType: string;
    invoiceId?: string;
    invoice: InvoiceType;
    productServiceId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ItemPlanning = { id: string; company: string; client: string; startDate: string; endDate: string }

export type ItemInfos = {
    id: string;
    startDate: Date;
    endDate: Date;
    invoideNumber: number;
    itemInvoiceType: $Enums.ItemInvoiceType;
    client: string;
    currency: string;
    amount: Decimal;
    createdAt: Date;

}

export type BillboardInfo = {
    name: string;
    category: string;
    emplacement: string;
    neighbourhood: string;
    address: string;
}

export type Sale = {
    id: string;
    amount: Decimal;
    startDate: Date;
    endDate: Date;
};

export type updatedItem = {
    name: string;
    quantity: number;
    price: string;
    updatedPrice: string;
    discountType: "purcent" | "money";
    id?: string | undefined;
    description?: string | undefined;
    locationStart?: Date | undefined;
    locationEnd?: Date | undefined;
    status?: "available" | "non-available" | undefined;
    discount?: string | undefined;
    currency?: string | undefined;
    itemType?: "billboard" | "product" | "service" | undefined;
    billboardId?: string | undefined;
    productServiceId?: string | undefined;
}