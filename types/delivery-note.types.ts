import { BillboardType } from "./billboard.types"
import { ClientType } from "./client.types"
import { CompanyType } from "./company.types"
import { ProductServiceType } from "./product-service.types"
import { ProjectType } from "./project.types"
import Decimal from "decimal.js"
import { ItemType } from "./item.type"

export type DeliveryNoteType = {
    id: string,
    deliveryNoteNumber: number,
    note: string,
    isComplete: boolean;
    photos: string[],
    files: string[],
    totalHT: Decimal,
    paymentLimit: string;
    discount: string,
    discountType: string,
    totalTTC: Decimal,
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
