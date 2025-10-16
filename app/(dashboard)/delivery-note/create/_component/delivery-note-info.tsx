'use client';

import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import Spinner from '@/components/ui/spinner'
import TextInput from '@/components/ui/text-input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { paymentTerms } from '@/lib/data';
import { addDays, formatDateToDashModel } from '@/lib/date';
import { formatNumber, parseItems } from '@/lib/utils';
import { ItemType } from '@/stores/item.store';
import { VatRateType } from '@/types/company.types';
import { CalculateTaxesResult, DiscountType, TaxItem } from '@/types/tax.type';
import Decimal from 'decimal.js';
import { Dispatch, SetStateAction } from 'react';

type DeliveryNoteInfoProps = {
    isGettingDeliveryNoteNumber: boolean;
    isGettingDocument: boolean;
    reference: string;
    calculate(params: {
        items: TaxItem[];
        taxes: VatRateType[];
        taxOperation?: "cumul" | "sequence";
        discount?: [number, "purcent" | "money"]
    }): CalculateTaxesResult;
    items: ItemType[];
    taxes: VatRateType[];
    currency: string;
    discount: DiscountType;
    setDiscount: Dispatch<SetStateAction<DiscountType>>;
    paymentLimit: string;
    setPaymentLimit: Dispatch<SetStateAction<string>>;
    HTPrice: Decimal;
    TTCPrice: Decimal;
    isCompleted?: boolean;
    amountType: "HT" | "TTC"
}

export default function DeliveryNoteInfo({ isGettingDocument, isGettingDeliveryNoteNumber, reference, calculate, items, taxes, currency, discount, setDiscount, paymentLimit, TTCPrice, setPaymentLimit, isCompleted, amountType, HTPrice }: DeliveryNoteInfoProps) {
    return (
        <>
            <div className="space-y-2">
                <div className="flex justify-between gap-x-2">
                    <h2 className="font-semibold">Bon de livraison</h2>
                    {isGettingDeliveryNoteNumber && isGettingDocument ? (
                        <Spinner size={10} />
                    ) : (
                        <p className="font-medium text-sm">
                            N°: {reference}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2 pb-4 border-neutral-200 border-b">
                <div className="flex justify-between text-sm">
                    <h2 className="font-semibold">Date</h2>
                    <p>{formatDateToDashModel(new Date())}</p>
                </div>
                <div className="flex justify-between text-sm">
                    <h2>Condition</h2>
                    <p>
                        <Combobox
                            disabled={isCompleted}
                            datas={paymentTerms}
                            value={paymentLimit}
                            setValue={setPaymentLimit}
                            placeholder=""
                            searchMessage="Rechercher une condition de paiement"
                            noResultsMessage="Aucune condition trouvé."
                            inputClassName='!h-8 w-[230px]'
                        />
                    </p>
                </div>
                <div className="flex justify-between text-sm">
                    <h2>Date d’échéance</h2>
                    <p>
                        {paymentLimit
                            ? addDays(
                                new Date(),
                                paymentTerms.find((p) => p.value === paymentLimit)
                                    ?.data ?? 0
                            ) as string
                            : "----"}
                    </p>
                </div>
            </div>
            <div className="space-y-2 pb-4 border-neutral-200 border-b">
                <div className="flex justify-between text-sm">
                    <h2>Total HT</h2>
                    <p>
                        {formatNumber(calculate({
                            items: parseItems(items),
                            taxes,
                            discount: discount.discount && discount.discountType ? [0, discount.discountType] : undefined
                            // discount: discount.discount && discount.discountType ? [discount.discount, discount.discountType] : undefined
                        }).totalWithoutTaxes)} {" "}
                        {currency}
                    </p>
                </div>
                {amountType === "TTC" &&
                    <ul>
                        {calculate({
                            items: parseItems(items),
                            taxes,
                        }).taxes.map((tax) => (
                            <li key={tax.taxName} className="flex justify-between text-sm">
                                <span>{tax.taxName} </span>
                                {formatNumber(tax.totalTax)} {currency}
                            </li>
                        ))}
                    </ul>
                }
                <div className="flex justify-between text-sm">
                    <h2>Réduction</h2>
                    <div className="flex items-center gap-x-2 max-w-[150px]">
                        <TextInput
                            disabled={isCompleted}
                            type="number"
                            value={
                                discount?.discount != null
                                    ? Number(String(discount.discount).replace("%", "")) // Toujours en nombre
                                    : 0
                            }
                            max={discount.discountType === "purcent" ? 100 : Infinity}
                            className="!rounded-lg h-8"
                            handleChange={(e) => {
                                setDiscount({
                                    ...discount,
                                    discount: Number(e)
                                });
                            }}
                        />
                        <ToggleGroup
                            disabled={isCompleted}
                            type="single"
                            value={discount.discountType}
                            onValueChange={(e) =>
                                setDiscount({
                                    ...discount,
                                    discountType: e as "purcent" | "money",
                                })
                            }
                        >
                            <ToggleGroupItem value="purcent">%</ToggleGroupItem>
                            <ToggleGroupItem value="money">$</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>
            </div>

            <div className="space-y-2 pb-4 border-neutral-200 border-b">
                {amountType === "TTC" ?
                    <div className="flex justify-between text-sm">
                        <h2 className="font-semibold">Total TTC</h2>
                        <p>
                            {items.length > 0 ? <>{formatNumber(TTCPrice)}</> : 0} {currency}
                        </p>
                    </div>
                    :
                    <div className="flex justify-between text-sm">
                        <h2 className="font-semibold">Total à payer</h2>
                        <p>
                            {items.length > 0 ? <>{formatNumber(HTPrice)}</> : 0} {currency}
                        </p>
                    </div>
                }
            </div>
        </>
    )
}
