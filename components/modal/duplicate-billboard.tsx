import { generalSans } from "@/fonts/font";
import { InvoiceType } from "@/types/invoice.types"
import TextInput from "../ui/text-input";
import { DatePicker } from "../ui/date-picker";
import { durationInMonths, getMonthsAndDaysDifference } from "@/lib/date";
import { formatNumber, parseItem } from "@/lib/utils";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import useItemStore, { ItemType } from "@/stores/item.store";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import Spinner from "../ui/spinner";
import { QuoteType } from "@/types/quote.types";
import { DeliveryNoteType } from "@/types/delivery-note.types";

type DuplicateBillboardProps = {
    data: InvoiceType | QuoteType | DeliveryNoteType;
    closeModal: () => void;
    duplicateTo: (items?: ItemType[] | undefined) => void;
    isDuplicating: boolean;
}

export default function DuplicateBillboard({ data, closeModal, duplicateTo, isDuplicating }: DuplicateBillboardProps) {
    const { calculate } = useCalculateTaxe();
    const items = useItemStore.use.items();
    const editItemField = useItemStore.use.editItemField();
    const locationBillboardDate = useItemStore.use.locationBillboardDate();

    function getDisabledRanges() {
        return locationBillboardDate.map(
            (item) => item.locationDate
        )
    }

    return (
        <div className="space-y-2">

            <ScrollArea className="h-[300px]">
                {items.map(item =>
                    <div
                        key={item.id}
                        className="group relative flex flex-col hover:bg-blue/5 p-1.5 border-blue border-l-4 w-full"
                    >

                        <small className="font-semibold">• {item.reference}</small>
                        <h2 className="font-semibold text-sm">{item.name} {item.hasTax && <span className="text-blue">*</span>}</h2>
                        {item.description && (
                            <pre className={`${generalSans.className} whitespace-pre-wrap mb-2 leading-tight text-sm`}>{item.description}</pre>
                        )}
                        <div className="flex justify-between items-center gap-x-2">
                            <div className="flex items-center gap-x-1 font-medium text-sm">
                                <span>{item.quantity}</span>
                                {" x "}
                                <span className="flex items-center gap-x-1">
                                    <TextInput
                                        type="number"
                                        min={0}
                                        disabled={true}
                                        value={item.price.toString()}
                                        handleChange={() => { }}
                                        className="w-32 h-8"
                                    />
                                    {item.currency}
                                </span>
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
                                        disabledRanges={getDisabledRanges()}
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
                                                editItemField(item.id, "locationStart", range.from);
                                                editItemField(item.id, "locationEnd", range.to);
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
                                    amountType: data.amountType,
                                    taxes: data.company.vatRates || [],
                                }).totalWithoutTaxes
                            )}{" "}
                            {item.currency}
                        </p>
                    </div>
                )}
            </ScrollArea>
            <div className='flex justify-end gap-x-2 '>
                <Button variant="primary" className="w-xs" disabled={isDuplicating} onClick={() => duplicateTo(items)} >
                    {isDuplicating ? <Spinner /> :
                        "Convertir"
                    }
                </Button>

                <Button variant="primary"
                    onClick={e => {
                        e.preventDefault()
                        closeModal()
                    }}
                    className="justify-center bg-neutral-100 w-[160px] text-black"
                >Quitter</Button>
            </div>
        </div>
    )
}
