import Decimal from "decimal.js";
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
    id: string;
    taxName: string;
    taxValue: string;
    cumul?: CumulType[] | undefined;
}

export type CompanyType = {
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
    niu: string;
    legalForms: string;
    capitalAmount: string;
    currency: string;
    bankAccountDetails: string;
    businessActivityType: string;
    fiscalYearStart: Date;
    fiscalYearEnd: Date;
    vatRates: VatRateType[];
    documentModel: ModelDocumentType
}

export type CompanyCountriesType = {
    id: string;
    country: string;
    companyName: string;
    currency: string
}


export type FilterDataType = {
    id: string;
    date: Date;
    reference: string;
    name: string
    count: number;
    totalGenerated: Decimal;
    totalPaid: Decimal;
    totalRemaining: Decimal
}


export type ReportType =
    | "salesByClient"
    | "salesByItem"
    | "salesByBillboards"
    | "paymentsByDate"
    | "paymentsByClients"
    | "paymentsByType"
    | "expensesByCategories"
    | "expensesJournal"
    | "debtorAccountAging";

export type PeriodType =
    | "currentFiscalYear"
    | "currentQuarter"
    | "currentMonth"
    | "previousMonth"
    | "previousYear";


export type SalesByClientItem = {
    id: string;
    date: Date;
    reference: string;
    name: string;
    count: number;
    totalGenerated: string;
    totalPaid: string;
    totalRemaining: string;
};

export type SalesByItemItem = {
    id: string;
    date: Date;
    reference: string;
    name: string;
    type: string;
    count: number;
    totalGenerated: string;
    totalPaid: string;
    totalRemaining: string;
};

export type SalesByBillboardItem = {
    id: string;
    date: Date;
    reference: string;
    name: string;
    type: string;
    count: number;
    totalGenerated: string;
    totalPaid: string;
    totalRemaining: string;
};

export type PaymentsByDateItem = {
    id: string;
    date: Date;
    client: string;
    amount: string;
};

export type PaymentsByTypeItem = {
    id: string;
    date: Date;
    source: string;
    amount: string;
};

export type PaymentsByClientItem = {
    id: string;
    client: string;
    count: number;
    totalPaid: string;
};

export type ExpensesByCategoryItem = {
    id: string;
    date: Date;
    category: string;
    count: number;
    totalAmount: string;
};

export type ExpensesJournalItem = {
    id: string;
    date: Date;
    reference: number;
    category: string;
    nature: string;
    source: string;
    beneficiary: string;
    description: string;
    paymentType: string;
    amount: string;
};

// Type pour l'âge des comptes débiteurs
export type DebtorAccountAgingItem = {
    id: string;
    client: string;
    totalDue: string;
    payableToday: string;
    delay1to30: string;
    delay31to60: string;
    delay61to90: string;
    delayOver91: string;
};

export type ReportData =
    | SalesByClientItem[]
    | SalesByItemItem[]
    | SalesByBillboardItem[]
    | PaymentsByDateItem[]
    | PaymentsByTypeItem[]
    | PaymentsByClientItem[]
    | ExpensesByCategoryItem[]
    | ExpensesJournalItem[]
    | DebtorAccountAgingItem[];

export type ReportTypeMap = {
    salesByClient: SalesByClientItem[];
    salesByItem: SalesByItemItem[];
    salesByBillboards: SalesByBillboardItem[];
    paymentsByDate: PaymentsByDateItem[];
    paymentsByType: PaymentsByTypeItem[];
    paymentsByClients: PaymentsByClientItem[];
    expensesByCategories: ExpensesByCategoryItem[];
    expensesJournal: ExpensesJournalItem[];
    debtorAccountAging: DebtorAccountAgingItem[];
};

export type GetReportType<T extends keyof ReportTypeMap> = ReportTypeMap[T];