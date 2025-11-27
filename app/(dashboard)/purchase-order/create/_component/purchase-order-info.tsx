'use client';

import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import Spinner from '@/components/ui/spinner'
import TextInput from '@/components/ui/text-input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { paymentTerms } from '@/lib/data';
import { addDays, formatDateToDashModel } from '@/lib/date';
import { formatNumber, parsePurchaseItems } from '@/lib/utils';
import { PurchaseItemType } from '@/stores/purchase-item.store';
import { VatRateType } from '@/types/company.types';
import { CalculateTaxesResult, DiscountType, TaxItem } from '@/types/tax.type';
import Decimal from 'decimal.js';
import { Dispatch, SetStateAction } from 'react';


type PurchaseOrderInfoProps = {
    isGettingPurchaseOrderNumber: boolean;
    isGettingDocument: boolean;
    reference: string;
    calculate(params: {
        items: TaxItem[];
        taxes: VatRateType[];
        taxOperation?: "cumul" | "sequence";
        discount?: [number, "purcent" | "money"]
    }): CalculateTaxesResult;
    items: PurchaseItemType[];
    taxes: VatRateType[];
    currency: string;
    discount: DiscountType;
    setDiscount: Dispatch<SetStateAction<DiscountType>>;
    paymentLimit: string;
    setPaymentLimit: Dispatch<SetStateAction<string>>;
    TTCPrice: Decimal;
    HTPrice: Decimal;
    isPaid?: boolean;
    amountPaid?: Decimal;
    amountType: "HT" | "TTC";
    payee?: Decimal;
    amountDue?: Decimal;
    disabled?: boolean
}

export default function PurchaseOrderInfo({ isGettingDocument, disabled, isGettingPurchaseOrderNumber, reference, calculate, items, taxes, currency, discount, setDiscount, paymentLimit, TTCPrice, setPaymentLimit, isPaid, amountPaid, HTPrice, amountType, payee, amountDue }: PurchaseOrderInfoProps) {
    return (
        <>
            <div className="space-y-2">
                <div className="flex justify-between gap-x-2">
                    <h2 className="font-semibold">Bon de commande</h2>
                    {isGettingPurchaseOrderNumber && isGettingDocument ? (
                        <Spinner size={10} />
                    ) : (
                        <p className="font-medium text-sm">
                            N°: {reference}
                        </p>
                    )}
                </div>
                {amountPaid?.eq(0) && !isPaid &&
                    <Badge variant="BLOCKED" className="rounded-sm h-6">En attente</Badge>
                }
                {amountPaid?.gt(0) && !isPaid &&
                    <Badge variant="IN_PROGRESS" className="rounded-sm h-6">En cours</Badge>
                }
                {amountPaid?.gt(0) && isPaid &&
                    <Badge variant="DONE" className="rounded-sm h-6">Payé</Badge>
                }
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
                            disabled={isPaid || disabled}
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
                            items: parsePurchaseItems(items),
                            taxes,
                            discount: discount.discount && discount.discountType ? [discount.discount, discount.discountType] : [0, discount.discountType],
                        }).totalWithoutTaxes)} {" "}
                        {currency}
                    </p>
                </div>
                <div className="flex justify-between text-sm">
                    <h2>Remise ( {discount.discountType === "purcent" ? `${discount.discount}%` : `${discount.discount} ${currency}`} )</h2>
                    <p>
                        {formatNumber(calculate({
                            items: parsePurchaseItems(items),
                            taxes,
                            discount: discount.discount && discount.discountType ? [discount.discount, discount.discountType] : [0, discount.discountType],
                        }).discountAmount)} {" "}
                        {currency}
                    </p>
                </div>
                {amountType === "TTC" &&
                    <ul>
                        {calculate({
                            items: parsePurchaseItems(items),
                            taxes,
                            discount: discount.discount && discount.discountType ? [discount.discount, discount.discountType] : [0, discount.discountType],
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
                            type="number"
                            disabled={amountPaid?.gt(0) || disabled}
                            value={
                                discount?.discount != null
                                    ? Number(String(discount.discount).replace("%", ""))
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
                            type="single"
                            disabled={amountPaid?.gt(0) || disabled}
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
                <div className="flex justify-between text-sm">
                    <h2>Reste à payer</h2>
                    <p>{amountDue ? formatNumber(amountDue) : 0} {currency}</p>
                </div>
                <div className="flex justify-between text-sm">
                    <h2>Payé</h2>
                    <p>{payee ? formatNumber(payee) : 0} {currency}</p>
                </div>
            </div>
        </>
    )
}
