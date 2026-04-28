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
    lighting?: string;
    structureTypeId?: string;
    structureType?: BaseType;
    panelCondition?: string;
    decorativeElement?: string;
    foundations?: string;
    electricity?: string;
    framework?: string;
    note?: string;


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
    identityCard?: string;
    passport?: string;
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


    delayContractStart?: Date;
    delayContractEnd?: Date;
    locationPrice?: string;
    nonLocationPrice?: string;
    rentalStartDate?: Date;
    rentalPeriod?: string;
    paymentMode?: string;
    paymentFrequency?: string;
    electricitySupply?: string;
    specificCondition?: string;

    companyId: string;
    company: CompanyType;
    clientId: string;
    client: ClientType;

    items: ItemType[]

    createdAt: Date;
    updatedAt: Date;
};

export type BillboardImportType = {
    "Référence": string
    "Article taxable": boolean
    "Type de panneau publicitaire": string
    "Nom du panneau publicitaire": string
    "Lieu": string
    "Ville (Panneau)": string
    "Quartier": string
    "Repère visuel": string
    "Support d'affichage": string
    "Orientation": string
    "Lien Google Maps": string

    "Prix de location": string
    "Coût d'installation": string
    "Coût d'entretien": string

    "Largeur": string
    "Hauteur": string
    "Surface": string

    "Éclairage": string
    "Type de structure": string
    "État du panneau": string

    "Éléments décoratifs": string
    "Fondations et visserie": string
    "Électricité et éclairage": string
    "Structure et châssis": string
    "Aspect général": string

    "Type d'espace": string
    "Type de bailleur": string

    "Prix du panneau loué": string
    "Prix du panneau non loué": string

    "Nom du bailleur": string
    "Adresse complète du bailleur": string
    "Ville (Bailleur)": string
    "Téléphone": string
    "Email": string

    "Nom de la banque": string
    "RIB": string
    "IBAN": string
    "BIC/SWIFT": string

    "Date début location": string
    "Durée du contrat": string
    "Mode de paiement": string
    "Fréquence de paiement": string
    "Fourniture du courant": string
    "Conditions particulières": string
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

export type BrochureBillboardItem = {
    id: string;
    type: string;
    name: string;
    height: string;
    color: string;
    width: string;
    address: string;
    orientation: string;
    dimension: string;
    images: string[];
    maps: string;
    reference: string;
}