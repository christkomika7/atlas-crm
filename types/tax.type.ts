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
    hasTax: boolean;
    discountType: "purcent" | "money";
    discount: number;
    quantity: number;
}

export type TaxInput = {
    id: string;
    taxName: string;
    taxValue: string;
    cumul?: CumulType[];
};

export type Item = {
    name: string;
    hasTax: boolean;
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
};

export type CalculateTaxesResult = {
    taxes: TaxResult[];
    totalTax: Decimal;
    totalWithTaxes: Decimal;
    totalWithoutTaxes: Decimal;
    currentPrice: Decimal;
    subtotal: Decimal;
    discountAmount: Decimal;
};

export type CalculateTaxesInput = {
    items: Item[];
    taxes: TaxInput[];
    amountType?: "HT" | "TTC";
    taxOperation: "sequence" | "cumul";
    discount?: [number, "purcent" | "money"]
};
