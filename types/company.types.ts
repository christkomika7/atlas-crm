import { ModelDocumentType } from "./document.types";

export type TaxType = {
    name: string;
    value: string;
}


export type CumulType = {
    id: number;
    name: string;
    check: boolean;
}

export type VatRateType = {
    taxName: string;
    taxValue: string;
    cumul?: CumulType[] | undefined;
}



export type CompanyType<E> = {
    id: string;
    companyName: string;
    country: string;
    city: string;
    codePostal: string;
    registeredAddress: string;
    phoneNumber: string;
    email: string;
    website: string;
    businessRegistrationNumber: string;
    taxIdentificationNumber: string;
    capitalAmount: string;
    currency: string;
    bankAccountDetails: string;
    businessActivityType: string;
    fiscalYearStart: Date;
    fiscalYearEnd: Date;
    vatRates: VatRateType[];
    employees: E[]
    documentModel: ModelDocumentType<string>
}

export type CompanyCountriesType = {
    id: string;
    country: string;
    companyName: string;
    currency: string
}

