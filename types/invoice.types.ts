import { Item } from "@/lib/generated/prisma"
import { BillboardType } from "./billboard.types"
import { ClientType } from "./client.types"
import { CompanyType } from "./company.types"
import { ProductServiceType } from "./product-service.types"
import { ProjectType } from "./project.types"

export type InvoiceType = {
    id: string,
    invoiceNumber: number,
    note: string,
    photos: string[],
    files: string[],
    totalHT: string,
    paymentLimit: string;
    discount: string,
    discountType: string,
    totalTTC: string,
    payee: string,
    clientId: string,
    client: ClientType,
    productsServices: ProductServiceType[],
    billboards: BillboardType[],
    projectId: string,
    project: ProjectType,
    items: Item[],
    companyId: string,
    company: CompanyType<string>,
    createdAt: Date,
    updatedAt: Date,

}