import { $Enums } from "@/lib/generated/prisma"
import { BillboardType } from "./billboard.types"
import { CompanyType } from "./company.types"
import { ProductServiceType } from "./product-service.types"
import { ProjectType } from "./project.types"
import { ItemType } from "./item.type"
import Decimal from "decimal.js"
import { SupplierType } from "./supplier.types"

export type PurchaseOrderType = {
    id: string,
    purchaseOrderNumber: number,
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
    isPaid: boolean;
    supplierId: string,
    supplier: SupplierType,
    productsServices: ProductServiceType[],
    projectId: string,
    project: ProjectType,
    items: ItemType[],
    companyId: string,
    company: CompanyType,
    createdAt: Date,
    updatedAt: Date,

}