import { AreaType } from "./area.types";
import { CompanyType } from "./company.types";
import { CityType } from "./city.types";
import { ClientType } from "./client.types";
import { ItemType } from "./item.type";
import { SupplierType } from "./supplier.types";
import Decimal from "decimal.js";
import { BaseType } from "./base.types";


export type BillboardType = {
    id: string;

    reference: string;
    hasTax: boolean;
    typeId: string;
    type: BaseType;
    name: string;
    locality: string;
    zone: string;
    areaId: string;
    area: AreaType;
    visualMarker: string;
    displayBoardId: string,
    displayBoard: BaseType;

    address: string;
    cityId: string;
    city: CityType
    orientation: string;
    gmaps: string;

    pathPhoto: string;
    pathBrochure: string;
    photos: string[]
    brochures: string[]

    rentalPrice: Decimal;
    installationCost: Decimal;
    maintenance: Decimal;
    revenueGenerate: Decimal;


    width: number;
    height: number;
    lighting: string;
    structureTypeId: string;
    structureType: BaseType;
    panelCondition: string;
    decorativeElement: string;
    foundations: string;
    electricity: string;
    framework: string;
    note: string;


    lessorSpaceType: string;
    lessorSupplierId?: string;
    lessorSupplier?: SupplierType;
    lessorTypeId: string;
    lessorType: BaseType;


    lessorName?: string;
    lessorAddress?: string;
    lessorCity?: string;
    lessorPhone?: string;
    lessorEmail?: string;
    capital?: Decimal;
    rccm?: string;
    taxIdentificationNumber?: string;
    niu?: string;
    legalForms: string;
    bankName?: string;
    rib?: string;
    iban?: string;
    bicSwift?: string;

    representativeFirstName?: string;
    representativeLastName?: string;
    representativeJob?: string;
    representativePhone?: string;
    representativeEmail?: string;


    rentalStartDate?: Date;
    rentalPeriod?: string;
    paymentMode?: string;
    paymentFrequency?: string;
    electricitySupply?: string;
    specificCondition?: string;

    companyId: string;
    company: CompanyType<string>;
    clientId: string;
    client: ClientType;

    items: ItemType[]

    createdAt: Date;
    updatedAt: Date;
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