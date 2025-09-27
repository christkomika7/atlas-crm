export type DiscountType = {
    discount: number;
    discountType: "purcent" | "money";
}


export type CumulType = {
    id: number;
    name: string;
    check: boolean;
};

export type TaxInput = {
    taxName: string;
    taxValue: string[];
    hasApplicableToAll: boolean;
    taxType?: "HT" | "TTC";
    cumul?: CumulType[];
};

export type Item = {
    name: string;
    price: string;
    discountType: "purcent" | "money";
    discount: number;
    quantity: number;
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

export type CalculateTaxesInput = {
    items: Item[];
    taxes: TaxInput[];
    taxOperation: "sequence" | "cumul";
    discount?: [number, "purcent" | "money"]
};
