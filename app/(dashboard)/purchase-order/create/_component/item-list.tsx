'use client';

import TextInput from "@/components/ui/text-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { generalSans } from "@/fonts/font";
import { formatNumber, parsePurchaseItem } from "@/lib/utils";
import usePurchaseItemStore, { PurchaseItemType } from "@/stores/purchase-item.store";
import { VatRateType } from "@/types/company.types";
import { CalculateTaxesResult, TaxItem } from "@/types/tax.type";
import Decimal from "decimal.js";

export type ItemListProps = {
    item: PurchaseItemType;
    taxes: VatRateType[];
    calculate(params: {
        items: TaxItem[];
        taxes: VatRateType[];
        taxOperation?: "cumul" | "sequence";
    }): CalculateTaxesResult;
    amountPaid?: Decimal;
}
export default function ItemList({ item, taxes, calculate, amountPaid }: ItemListProps) {
    const updateItem = usePurchaseItemStore.use.updateItem();
    const removeItem = usePurchaseItemStore.use.removeItem();
    const editItemField = usePurchaseItemStore.use.editItemField();

    const discount: number = item.discount != null
        ? String(item.discount).includes("%")
            ? Number(String(item.discount).replace("%", ""))
            : Number(item.discount)
        : 0;


    return (
        <div
            className="group relative flex flex-col hover:bg-blue/5 p-1.5 border-blue border-l-4 w-full"
        >
            {amountPaid?.eq(0) &&
                <span
                    className="top-0 right-1 absolute opacity-0 group-hover:opacity-100 font-bold text-red-500 text-sm transition-opacity cursor-pointer"
                    onClick={() => removeItem(item.productServiceId as string)}
                >
                    ×
                </span>
            }
            <small className="font-semibold">• {item.reference}</small>
            <h2 className="font-semibold text-sm">{item.name}</h2>
            {item.description && (
                <pre className={`${generalSans.className} whitespace-pre-wrap mb-2 leading-tight text-sm`}>{item.description}</pre>
            )}
            <div className="flex justify-between items-center gap-x-2">
                <div className="flex items-center gap-x-1 font-medium text-sm">
                    <span>
                        <TextInput
                            type="number"
                            min={0}
                            disabled={amountPaid?.gt(0)}
                            value={item.selectedQuantity}
                            handleChange={(e) => {
                                editItemField(item.id, "selectedQuantity", Number(e));
                            }}
                            className="w-16 h-8"
                        />
                    </span>
                    {" x "}
                    <span className="flex items-center gap-x-1">
                        <TextInput
                            type="number"
                            min={0}
                            disabled={amountPaid?.gt(0)}
                            value={item.price.toString()}
                            handleChange={(e) => {
                                editItemField(item.id, "price", new Decimal(String(e)));
                            }}
                            className="w-32 h-8"
                        />
                        {item.currency}
                    </span>
                </div>

                <div className="flex items-center gap-x-2 max-w-[150px]">
                    <TextInput
                        type="number"
                        min={0}
                        disabled={amountPaid?.gt(0)}
                        value={discount}
                        className="!rounded-lg h-8"
                        handleChange={(e) =>
                            updateItem({ ...item, discount: String(e) })
                        }
                    />
                    <ToggleGroup
                        type="single"
                        disabled={amountPaid?.gt(0)}
                        value={item.discountType}
                        onValueChange={(e) => {
                            updateItem({
                                ...item,
                                discountType: e as "purcent" | "money",
                            });
                        }}
                    >
                        <ToggleGroupItem value="purcent">%</ToggleGroupItem>
                        <ToggleGroupItem value="money">$</ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>
            <p className="text-xs pt-2">
                <span className="font-semibold">Total HT: </span>
                {formatNumber(
                    calculate({
                        items: [parsePurchaseItem(item)],
                        taxes,
                    }).totalWithoutTaxes
                )}{" "}
                {item.currency}
            </p>
        </div>
    )
}
