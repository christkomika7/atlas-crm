import { $Enums } from "@/lib/generated/prisma";
import { BillboardType } from "./billboard.types";
import { InvoiceType } from "./invoice.types";


export type ItemType = {
    id: string;
    billboardId: string | null;
    billboard: BillboardType;
    name: string;
    description: string | null;
    itemInvoiceType: $Enums.ItemInvoiceType
    locationStart: Date;
    locationEnd: Date;
    quantity: number;
    price: string;
    updatedPrice: string;
    discount: string;
    discountType: string;
    currency: string;
    itemType: string;
    invoiceId: string | null;
    invoice: InvoiceType;
    productServiceId: string | null;
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
    amount: string;
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
    amount: number;
    startDate: Date;
    endDate: Date;
};