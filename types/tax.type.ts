import Decimal from "decimal.js";

export type DiscountType = {
    discount: number;
    discountType: "purcent" | "money";
}


export type CumulType = {
    id: number;
    name: string;
    check: boolean;
};

export type TaxItem = {
    name: string;
    price: Decimal;
    discountType: "purcent" | "money";
    discount: number;
    quantity: number;
}

export type TaxInput = {
    taxName: string;
    taxValue: string[];
    hasApplicableToAll: boolean;
    taxType?: "HT" | "TTC";
    cumul?: CumulType[];
};

export type Item = {
    name: string;
    price: Decimal;
    discountType: "purcent" | "money";
    discount: number;
    quantity: number;
};

export type TaxResult = {
    taxName: string;
    appliedRates: number[];
    totalTax: Decimal;
    taxPrice: Decimal;
    taxType?: "HT" | "TTC";
};

export type CalculateTaxesResult = {
    taxes: TaxResult[];
    totalTax: Decimal;
    totalWithTaxes: Decimal;
    totalWithoutTaxes: Decimal;
};

export type CalculateTaxesInput = {
    items: Item[];
    taxes: TaxInput[];
    amountType?: "HT" | "TTC";
    taxOperation: "sequence" | "cumul";
    discount?: [number, "purcent" | "money"]
};
