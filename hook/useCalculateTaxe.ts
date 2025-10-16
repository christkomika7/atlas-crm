import { calculateTaxes } from "@/lib/price";
import { VatRateType } from "@/types/company.types";
import { CalculateTaxesResult, TaxItem } from "@/types/tax.type";

type UseCalculateTaxeReturn = {
    calculate: (params: {
        items: TaxItem[];
        taxes: VatRateType[];
        amountType?: "HT" | "TTC";
        taxOperation?: "cumul" | "sequence";
        discount?: [number, "purcent" | "money"]
    }) => CalculateTaxesResult;
};

export function useCalculateTaxe(): UseCalculateTaxeReturn {
    const calculate = ({
        items,
        taxes,
        taxOperation = "sequence",
        discount,
        amountType = "TTC"
    }: {
        items: TaxItem[];
        taxes: VatRateType[];
        taxOperation?: "cumul" | "sequence";
        amountType?: "HT" | "TTC";
        discount?: [number, "purcent" | "money"]
    }): CalculateTaxesResult => {
        return calculateTaxes({
            items: items.map((item) => ({
                name: item.name as string,
                price: item.price,
                discountType: item.discountType as "purcent" | "money",
                discount: Number(String(item.discount ?? 0).replace("%", "")),
                quantity: item.quantity as number,
            })),
            amountType,
            taxes,
            taxOperation,
            discount
        });
    };

    return { calculate };
}
