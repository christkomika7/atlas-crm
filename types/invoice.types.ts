import { $Enums } from "@/lib/generated/prisma"
import { BillboardType } from "./billboard.types"
import { ClientType } from "./client.types"
import { CompanyType } from "./company.types"
import { ProductServiceType } from "./product-service.types"
import { ProjectType } from "./project.types"
import { ItemType } from "./item.type"
import Decimal from "decimal.js"

export type InvoiceType = {
    id: string,
    invoiceNumber: number,
    note: string,
    photos: string[],
    files: string[],
    amountType: $Enums.AmountType;
    totalHT: Decimal,
    totalTTC: Decimal,
    payee: Decimal,
    paymentLimit: string;
    discount: string,
    discountType: string,
    fromRecordId: string;
    fromRecordName: string;
    fromRecordReference: string;
    isPaid: boolean;
    clientId: string,
    client: ClientType,
    productsServices: ProductServiceType[],
    billboards: BillboardType[],
    projectId: string,
    project: ProjectType,
    items: ItemType[],
    companyId: string,
    company: CompanyType<string>,
    createdAt: Date,
    updatedAt: Date,

}

export type BillboardItem = {
    name: string;
    quantity: number;
    price: Decimal;
    updatedPrice: Decimal;
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

export type ExistingBillboardItem = {
    id: string;
    billboardId: string | null;
    locationStart: Date | null;
    locationEnd: Date | null;
    invoiceId?: string;
}

export type ConflictResult = {
    hasConflict: boolean;
    conflicts: Array<{
        newItem: BillboardItem;
        conflictingItem: ExistingBillboardItem;
        message: string;
    }>;
}

export type RecurrenceType = {
    invoiceId: string;
    companyId: string;
    repeat: string;
}