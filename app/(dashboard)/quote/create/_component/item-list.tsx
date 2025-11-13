'use client';

import { DatePicker } from "@/components/ui/date-picker";
import TextInput from "@/components/ui/text-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { generalSans } from "@/fonts/font";
import { durationInMonths, getMonthsAndDaysDifference } from "@/lib/date";
import { formatNumber, parseItem } from "@/lib/utils";
import useItemStore, { ItemType, LocationBillboardDateType } from "@/stores/item.store";
import { VatRateType } from "@/types/company.types";
import { CalculateTaxesResult, TaxItem } from "@/types/tax.type";
import Decimal from "decimal.js";
import { toast } from "sonner";

export type ItemListProps = {
    item: ItemType;
    taxes: VatRateType[];
    calculate(params: {
        items: TaxItem[];
        taxes: VatRateType[];
        amountType: "TTC" | "HT";
        taxOperation?: "cumul" | "sequence";
    }): CalculateTaxesResult;
    isCompleted?: boolean;
    locationBillboardDate: LocationBillboardDateType[];
    amountType: "TTC" | "HT";
}
export default function ItemList({ item, taxes, calculate, isCompleted, locationBillboardDate, amountType }: ItemListProps) {

    const updateItem = useItemStore.use.updateItem();
    const removeItem = useItemStore.use.removeItem();
    const editItemField = useItemStore.use.editItemField();
    const itemQuantities = useItemStore.use.itemQuantity();

    const discount: number = item.discount != null
        ? String(item.discount).includes("%")
            ? Number(String(item.discount).replace("%", ""))
            : Number(item.discount)
        : 0;


    function getDisabledRanges() {
        console.log({ locationBillboardDate });
        const disabledData = locationBillboardDate.filter(billboard => billboard.billboardReference === item.billboardId);
        return disabledData.map(
            (item) => item.locationDate
        )
    }

    function getMaxQuantity() {
        if (item.itemType !== "billboard") {
            return itemQuantities.find(i => item.productServiceId && i.id === item.productServiceId)?.quantity || Infinity;
        }
        return Infinity
    }

    return (
        <div
            className="group relative flex flex-col hover:bg-blue/5 p-1.5 border-blue border-l-4 w-full"
        >
            <span
                className="top-0 right-1 absolute opacity-0 group-hover:opacity-100 font-bold text-red-500 text-sm transition-opacity cursor-pointer"
                onClick={() => removeItem(item.itemType === "billboard" ? item.billboardId as string : item.productServiceId as string)}
            >
                ×
            </span>

            <small className="font-semibold">• {item.reference}</small>
            <h2 className="font-semibold text-sm">{item.name}</h2>
            {item.description && (
                <pre className={`${generalSans.className} whitespace-pre-wrap mb-2 leading-tight text-sm`}>{item.description}</pre>
            )}
            <div className="flex justify-between items-center gap-x-2">
                <div className="flex items-center gap-x-1 font-medium text-sm">
                    {item.itemType === "billboard" ? item.quantity :
                        <span>
                            <TextInput
                                disabled={isCompleted}
                                type="number"
                                min={0}
                                max={getMaxQuantity()}
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
                            disabled={isCompleted}
                            type="number"
                            min={0}
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
                        disabled={isCompleted}
                        type="number"
                        min={0}
                        value={discount}
                        className="!rounded-lg h-8"
                        handleChange={(e) =>
                            updateItem({ ...item, discount: String(e) })
                        }
                    />
                    <ToggleGroup
                        disabled={isCompleted}
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
                            disabled={isCompleted}
                            className="flex w-[300px]"
                            label=""
                            disabledRanges={getDisabledRanges()}
                            mode="range"
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
                                    const duration = durationInMonths(range.from, range.to);
                                    editItemField(
                                        item.id,
                                        'quantity',
                                        duration < 0.5 ? 0.5 : duration
                                    );
                                    editItemField(item.id, "locationStart", new Date(range.from))
                                    editItemField(item.id, "locationEnd", new Date(range.to));
                                    return;
                                }
                                editItemField(item.id, 'quantity', 1);
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
            <p className="text-xs">
                <span className="font-semibold">Total HT: </span>
                {formatNumber(
                    calculate({
                        items: [parseItem(item)],
                        amountType,
                        taxes,
                    }).totalWithoutTaxes
                )}{" "}
                {item.currency}
            </p>
        </div>
    )
}
