'use client';

import { DatePicker } from "@/components/ui/date-picker";
import TextInput from "@/components/ui/text-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { generalSans } from "@/fonts/font";
import { getMonthsAndDaysDifference } from "@/lib/date";
import { formatNumber } from "@/lib/utils";
import useItemStore, { ItemType, LocationBillboardDateType } from "@/stores/item.store";
import { VatRateType } from "@/types/company.types";
import { CalculateTaxesResult } from "@/types/tax.type";
import { toast } from "sonner";

export type ItemListProps = {
    item: ItemType;
    locationBillboardDate: LocationBillboardDateType[];
    taxes: VatRateType[];
    calculate(params: {
        items: ItemType[];
        taxes: VatRateType[];
        taxOperation?: "cumul" | "sequence";
    }): CalculateTaxesResult
}
export default function ItemList({ item, locationBillboardDate, taxes, calculate }: ItemListProps) {
    const updateItem = useItemStore.use.updateItem();
    const removeItem = useItemStore.use.removeItem();
    const editItemField = useItemStore.use.editItemField();

    const discount: number = item.discount != null
        ? String(item.discount).includes("%")
            ? Number(String(item.discount).replace("%", ""))
            : Number(item.discount)
        : 0;


    return (
        <div
            className="group relative flex flex-col hover:bg-blue/5 p-1.5 border-blue border-l-4 w-full"
        >
            <span
                className="top-0 right-1 absolute opacity-0 group-hover:opacity-100 font-bold text-red-500 text-sm transition-opacity cursor-pointer"
                onClick={() => removeItem(item.id)}
            >
                ×
            </span>

            <h2 className="font-semibold text-sm">{item.name}</h2>
            {item.description && (
                <pre className={`${generalSans.className} mb-2 leading-tight text-sm`}>{item.description}</pre>
            )}
            <div className="flex justify-between items-center gap-x-2">
                <div className="flex items-center gap-x-1 font-medium text-sm">
                    {item.itemType === "billboard" ? 1 :
                        <span>
                            <TextInput
                                type="number"
                                min={0}
                                max={item.maxQuantity ?? 0}
                                value={item.quantity}
                                handleChange={(e) => {
                                    if (
                                        item.maxQuantity &&
                                        Number(e) > item.maxQuantity
                                    ) {
                                        editItemField(
                                            item.id,
                                            "quantity",
                                            Number(item.maxQuantity)
                                        );
                                        return toast.error(
                                            "La quantité max valable est " +
                                            item.maxQuantity
                                        );
                                    }
                                    editItemField(item.id, "quantity", Number(e));
                                }}
                                className="w-16 h-8"
                            />
                        </span>
                    }
                    {" x "}
                    <span className="flex items-center gap-x-1">
                        <TextInput
                            type="number"
                            min={0}
                            value={item.price}
                            handleChange={(e) => {
                                editItemField(item.id, "price", String(e));
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
                        value={discount}
                        className="!rounded-lg h-8"
                        handleChange={(e) =>
                            updateItem({ ...item, discount: String(e) })
                        }
                    />
                    <ToggleGroup
                        type="single"
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
            <div className="mb-2">
                {item.itemType === "billboard" && (
                    <div className="flex mt-3 flex-col">
                        <label htmlFor="" className="text-xs font-medium">Durée de la location<span className="text-red-500">*</span></label>
                        <DatePicker
                            className="flex w-[300px]"
                            label=""
                            mode="range"
                            disabledRanges={
                                locationBillboardDate.filter(it => it.id !== item.id).map(
                                    (item) => item.locationDate
                                )
                            }
                            value={
                                item.locationStart && item.locationEnd
                                    ? {
                                        from: new Date(item.locationStart),
                                        to: new Date(item.locationEnd),
                                    }
                                    : undefined
                            }
                            onChange={(e) => {
                                const range = e as
                                    | { from: Date; to: Date }
                                    | undefined;
                                if (range) {
                                    editItemField(item.id, "locationStart", range.from);
                                    editItemField(item.id, "locationEnd", range.to);
                                    return;
                                }
                                editItemField(item.id, "locationStart", undefined);
                                editItemField(item.id, "locationEnd", undefined);
                            }}
                        />
                    </div>
                )}
            </div>
            {item.itemType === "billboard" && item.locationStart && item.locationEnd &&
                <p className="text-xs">
                    <span className="font-semibold">Durée: </span>
                    {getMonthsAndDaysDifference(item.locationStart, item.locationEnd)}
                </p>
            }
            <ul>
                {calculate({
                    items: [item],
                    taxes: taxes,
                }).taxes.map((tax) => (
                    <li key={tax.taxName} className="text-xs">
                        <span className="font-semibold">{tax.taxName}: </span>
                        {formatNumber(tax.totalTax)} {item.currency}
                    </li>
                ))}
            </ul>
            <p className="text-xs">
                <span className="font-semibold">Total HT: </span>
                {formatNumber(
                    calculate({
                        items: [item],
                        taxes,
                    }).totalWithoutTaxes
                )}{" "}
                {item.currency}
            </p>
            <p className="text-xs">
                <span className="font-semibold">Total TTC: </span>
                {formatNumber(
                    calculate({
                        items: [item],
                        taxes,
                    }).totalWithTaxes
                )}{" "}
                {item.currency}
            </p>
        </div>
    )
}
