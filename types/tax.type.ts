export type Item = {
    name: string;
    price: string;
    discountType: "purcent" | "money";
    discount: number;
    quantity: number;
};

export type TaxInput = {
    taxName: string;
    taxValue: string[];
    hasApplicableToAll: boolean;
    taxType?: "HT" | "TTC";
    cumul?: { id: number; name: string; check: boolean }[];
};

export type TaxResult = {
    taxName: string;
    appliedRates: number[];
    totalTax: number;
    taxPrice: number;
    taxType?: "HT" | "TTC";
};

export type CalculateTaxesResult = {
    taxes: TaxResult[];
    totalTax: number;
    totalWithTaxes: number;
    totalWithoutTaxes: number;
};

export type CalculateTaxesParamsTotal = {
    totalPrice: number;
    taxes: TaxInput[];
    taxOperation?: "cumul" | "sequence";
};

export type TaxResultTotal = {
    taxName: string;
    appliedRates: number[];
    totalTax: number;
    taxPrice: number;
    taxType?: "HT" | "TTC";
};

export type CalculateTaxesResultTotal = {
    taxes: TaxResultTotal[];
    totalTax: number;
    totalWithTaxes: number;
    totalWithoutTaxes: number;
};