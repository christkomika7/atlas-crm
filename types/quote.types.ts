import { BillboardType } from "./billboard.types"
import { ClientType } from "./client.types"
import { CompanyType } from "./company.types"
import { ProductServiceType } from "./product-service.types"
import { ProjectType } from "./project.types"
import Decimal from "decimal.js"
import { ItemType } from "./item.type"
import { $Enums } from "@/lib/generated/prisma"

export type QuoteType = {
    id: string,
    quoteNumber: number,
    note: string,
    photos: string[],
    files: string[],
    amountType: $Enums.AmountType;
    isComplete: boolean;
    totalHT: Decimal,
    paymentLimit: string;
    discount: string,
    discountType: string,
    totalTTC: Decimal,
    clientId: string,
    client: ClientType,
    fromRecordId: string;
    fromRecordName: string;
    fromRecordReference: string;
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
