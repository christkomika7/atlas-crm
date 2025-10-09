import { AreaType } from "./area.types";
import { CompanyType } from "./company.types";
import { CityType } from "./city.types";
import { BillboardTypeType } from "./billboard-type.types";
import { ClientType } from "./client.types";
import { ItemType } from "./item.type";
import { SupplierType } from "./supplier.types";
import Decimal from "decimal.js";

export type BillboardType = {
    id: string;
    reference: string;
    pathBrochure: string;
    pathContract: string;
    pathFile: string;
    pathPhoto: string;
    typeId: string;
    type: BillboardTypeType;
    name: string;
    locationDuration: Date[];
    dimension: string;
    city: CityType
    area: AreaType;
    placement: string;
    cityId: string;
    areaId: string;
    revenueGenerate: Decimal;
    orientation: string;
    information?: string;
    address: string;
    gmaps: string;
    zone: string;
    rentalPrice: Decimal;
    installationCost: Decimal;
    maintenance: Decimal;
    imageFiles: string[];
    brochureFiles: string[];
    structure: string;
    decorativeElement: string;
    foundations: string;
    technicalVisibility: string;
    note: string;
    lessorType: string;
    lessorSpaceType: string;
    lessorSupplierId?: string;
    lessorSupplier?: SupplierType;
    lessorName?: string;
    lessorEmail?: string;
    lessorPhone?: string;
    lessorJob?: string;
    capital?: Decimal;
    rccm?: string;
    taxIdentificationNumber?: string;
    lessorAddress?: string;
    representativeName?: string;
    representativeContract?: string;
    leasedSpace?: string;
    contractDuration: Date[];
    paymentMethod?: string;
    specificCondition?: string;
    signedLeaseContract: string[];
    files: string[];
    companyId: string;
    company: CompanyType<string>;
    clientId: string;
    client: ClientType;
    createdAt: Date;
    updatedAt: Date;
    items: ItemType[]
};

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