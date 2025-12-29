import Spinner from "@/components/ui/spinner";
import { araboto } from "@/fonts/font";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import { formatDateToDashModel, getMonthsAndDaysDifference } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import { cn, formatNumber, getAmountPrice, parseItem, parseItems, resolveImageSrc, urlToFile } from "@/lib/utils";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { InvoiceType } from "@/types/invoice.types";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { QuoteType } from "@/types/quote.types";
import Decimal from "decimal.js";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type DocumentPreviewProps = {
    id: string;
    title: string;
    type: string;
    firstColor: string;
    secondColor: string;
    logo?: string;
    logoSize?: string;
    logoPosition?: string;
    orderValue: string;
    orderNote: string;
    record?: InvoiceType | QuoteType | DeliveryNoteType | PurchaseOrderType;
    isLoading?: boolean;
    recordNumber: string;
    payee?: Decimal;
    supplier?: {
        companyName: string;
        email: string;
        address: string;
    };
    moreInfos?: boolean
};

function isPurchaseOrder(record: any): record is PurchaseOrderType {
    return record && 'supplier' in record && !('client' in record);
}

export default function RecordDocument({
    title,
    type,
    firstColor,
    secondColor,
    logo,
    logoSize,
    logoPosition,
    orderValue,
    isLoading,
    record,
    id,
    recordNumber,
    supplier,
    payee,
    moreInfos = true
}: DocumentPreviewProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { calculate } = useCalculateTaxe();

    async function getProfil() {
        if (logo) {
            const file = await urlToFile(logo);
            const resolveImage = resolveImageSrc(file);
            if (resolveImage) {
                setLogoPreview(resolveImage)
            }
        }
    }

    useEffect(() => {
        getProfil()
    }, [logo])

    const getRecipientInfo = () => {
        if (supplier) {
            return {
                companyName: supplier.companyName,
                email: supplier.email,
                address: supplier.address,
            };
        }

        if (record) {
            if (isPurchaseOrder(record)) {
                return {
                    companyName: record.supplier.companyName,
                    email: record.supplier.email,
                    address: record.supplier.address,
                };
            } else {
                return {
                    companyName: record.client.companyName,
                    email: record.client.email,
                    address: record.client.address,
                };
            }
        }

        return { companyName: '', email: '', address: '' };
    };

    const recipientInfo = getRecipientInfo();

    if (isLoading && !record) return <Spinner />;

    return (
        <div id={id} className="py-8 min-w-[595px]" style={{
            fontFamily: araboto.style?.fontFamily || "sans-serif",
            fontSize: "0.75rem",
            color: "#464646"
        }}>
            <div
                className="flex w-full h-[155px] px-[27px]"
                style={{
                    justifyContent:
                        logoPosition === "Left"
                            ? "flex-start"
                            : logoPosition === "Right"
                                ? "flex-end"
                                : "center",
                    alignItems: "center",

                }}

            >
                <div
                    className={cn(
                        "relative flex justify-center  items-center object-center object-contain",
                        logoSize === "Small" && "h-[80px]",
                        logoSize === "Medium" && "h-[120px]",
                        logoSize === "Large" && "h-[160px]"
                    )}
                >
                    {logoPreview ? (
                        <Image
                            src={logoPreview}
                            alt="Logo"
                            width={160}
                            height={160}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <h2 className="font-bold !text-4xl">LOGO</h2>
                    )}
                </div>
            </div>
            <div
                className="w-full h-[3.19px]"
                style={{
                    backgroundColor: firstColor,
                }}
            ></div>
            <div
                className="relative grid grid-cols-2 gap-x-2 mb-[38.26px] py-[14.5] px-[27px]"
                style={{
                    backgroundColor: secondColor,
                }}
            >
                <div
                    className="-bottom-3 left-1/2 absolute w-6 h-6 -translate-x-1/2"
                    style={{
                        backgroundColor: secondColor,
                        transform: 'rotate(45deg)',
                    }}
                ></div>

                <div style={{ display: "flex", flexDirection: "column", }}>
                    <p style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr",
                        columnGap: "69px",
                        marginBottom: "3px",

                    }}>
                        <span className="font-medium">{type} N° :</span>
                        <span className="font-normal">{orderValue}-{recordNumber}</span>
                    </p>

                    <p style={{ display: "grid", gridTemplateColumns: "80px 1fr", columnGap: "69px", marginBottom: "3px", }}>
                        <span className="font-medium">Date :</span>
                        <span className="font-normal">
                            {record?.updatedAt ? formatDateToDashModel(new Date(record.updatedAt)) : formatDateToDashModel(new Date())}
                        </span>
                    </p>

                    <p style={{ display: "grid", gridTemplateColumns: "80px 1fr", columnGap: "69px", }}>
                        <span className="font-medium">À :</span>
                        <span className="font-normal">
                            {recipientInfo.companyName} <br />
                            {recipientInfo.email} <br />
                            {recipientInfo.address}
                        </span>
                    </p>
                </div>

                <div >
                    <h2 className="font-black !text-[1.275rem] mb-[12px] text-right">
                        {title}
                    </h2>
                    <div className="">
                        <p className="text-right mb-[3px]">
                            {record?.company.registeredAddress}
                        </p>
                        <p className="mb-[3px] text-right">
                            BP: {record?.company.codePostal}
                        </p>
                        <p className="mb-[3px] text-right">
                            {record?.company.city},{" "}
                            {getCountryFrenchName(record?.company.country as string)}
                        </p>
                        <p className="mb-[3px] text-right">
                            {record?.company.email}
                        </p>
                        {record?.company.website && (
                            <p className="mb-[3px] text-right">
                                <Link href={record?.company.website}>
                                    {record?.company.website}
                                </Link>
                            </p>
                        )}
                        <p className="mb-[3px] text-right">
                            {record?.company.phoneNumber}
                        </p>
                        <p className="mb-[3px] text-right">
                            RCCM: {record?.company.businessRegistrationNumber}
                        </p>
                        <p className="text-right">
                            NIF: {record?.company.taxIdentificationNumber}
                        </p>
                    </div>
                </div>
            </div>

            <table className="w-full px-8">
                <thead className="h-12">
                    <tr className="!border-y border-[#bfbfbf] w-full">
                        <td className="pl-[27px] font-semibold">Article</td>
                        <td className="w-[50px] font-bold text-right">
                            Qté
                        </td>
                        <td className="w-[130px] font-bold text-right">
                            Prix unitaire
                        </td>
                        <td className="w-[260px] pr-[27px] font-bold text-right">
                            Prix total
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {record?.items.map((item) => (
                        <tr key={item.id}>
                            <td className="px-[27px] py-2 align-top">
                                <p className="mb-[3px]">{item.name} {item.hasTax && <span className="text-blue">*</span>}</p>
                                <p className={`whitespace-pre-wrap mb-[8px] leading-snug`}>{item.description}</p>
                                {item.itemType === "billboard" &&
                                    <p className={`whitespace-pre-wrap flex flex-col mb-[3px] leading-tight`}>
                                        <span>Durée de la compagne : </span>
                                        <span>Du {new Date(item.locationStart).toLocaleDateString("fr-fr", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        })} au {new Date(item.locationEnd).toLocaleDateString("fr-fr", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric"
                                        })}{" "}
                                            ({getMonthsAndDaysDifference(new Date(item.locationStart), new Date(item.locationEnd))}).
                                        </span>
                                    </p>
                                }
                            </td>
                            <td className="py-2 text-right align-top">
                                {item.quantity}
                            </td>
                            <td className="py-2 text-right align-top">
                                {moreInfos &&
                                    <>
                                        {formatNumber(
                                            calculate({
                                                items: [parseItem(item)],
                                                taxes: record.company?.vatRates ?? [],
                                                amountType: record.amountType,
                                            }).totalWithoutTaxes
                                        )}{" "}
                                        {item.currency}
                                    </>
                                }
                            </td>
                            <td className="py-2 text-right pr-[27px] align-top">
                                {moreInfos && <>
                                    {formatNumber(
                                        calculate({
                                            items: [parseItem(item)],
                                            taxes: record.company?.vatRates ?? [],
                                            amountType: record.amountType,
                                        }).totalWithoutTaxes
                                    )}
                                    {" "}
                                    {item.currency}
                                </>}
                            </td>
                        </tr>
                    ))}
                </tbody>
                {moreInfos &&
                    <tfoot>
                        <tr className="h-[29px]"></tr>
                        <tr>
                            <td colSpan={3} className="text-right">
                                Sous-Total
                            </td>
                            <td className="pr-[27px] text-right">
                                {formatNumber(calculate({
                                    items: (record ? (parseItems(record.items)) : []),
                                    taxes: record?.company?.vatRates ?? [],
                                    amountType: record?.amountType || "TTC",
                                    discount: [Number(record?.discount || 0), record?.discountType as "money" | "purcent"]
                                }).SubTotal)}
                                {record?.company.currency}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="text-right">
                                Remise ({record?.discountType === "money" ? `${formatNumber(record!.discount)} ${record?.company?.currency}` : `${record!.discount}%`})
                            </td>
                            <td className="pr-[27px] text-right">
                                {formatNumber(calculate({
                                    items: (record ? (parseItems(record.items)) : []),
                                    taxes: record?.company?.vatRates ?? [],
                                    amountType: record?.amountType || "TTC",
                                    discount: [Number(record?.discount || 0), record?.discountType as "money" | "purcent"]
                                }).discountAmount.toString())} {" "}{record?.company.currency}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} className="text-right">
                                Sous-total
                            </td>
                            <td className="pr-[27px] text-right">
                                {formatNumber(calculate({
                                    items: (record ? (parseItems(record.items)) : []),
                                    taxes: record?.company?.vatRates ?? [],
                                    amountType: record?.amountType || "TTC",
                                    discount: [Number(record?.discount || 0), record?.discountType as "money" | "purcent"]
                                }).subTotal)}
                                {record?.company.currency}
                            </td>
                        </tr>
                        {record?.amountType === "TTC" &&
                            <>
                                {calculate({
                                    items: (record ? (parseItems(record.items)) : []),
                                    taxes: record?.company?.vatRates ?? [],
                                    amountType: record?.amountType || "TTC",
                                    discount: [Number(record?.discount || 0), record?.discountType as "money" | "purcent"]
                                }).taxes.map((tax) => (
                                    <tr key={tax.taxName}>
                                        <td colSpan={3} className="text-right">
                                            {tax.taxName} </td>
                                        <td className="pr-[27px] text-right">  {formatNumber(tax.totalTax)} {record?.company?.currency}</td>
                                    </tr>
                                ))}
                            </>
                        }
                        {record?.amountType === "TTC" &&
                            <tr>
                                <td colSpan={3} className="text-right">
                                    Total TTC
                                </td>
                                <td className="pr-[27px] text-right">{formatNumber(record!.totalTTC)} {record?.company.currency}</td>
                            </tr>
                        }

                        <tr className="h-5"></tr>
                        {payee &&
                            <tr >
                                <td colSpan={3} className="text-right">
                                    Payé
                                </td>
                                <td className="pr-[27px] text-right">{formatNumber(payee)} {record?.company.currency}</td>
                            </tr>
                        }
                        <tr className="h-[8px]"></tr>
                        <tr>
                            <td></td>
                            <td
                                style={{
                                    backgroundColor: secondColor,
                                }}
                            ></td>
                            <td
                                style={{
                                    backgroundColor: secondColor,
                                }}
                                className="py-3 text-2xl font-black text-right"
                            >
                                Net à payer
                            </td>
                            <td
                                style={{
                                    backgroundColor: secondColor,
                                }}
                                className="pr-[27px] text-2xl font-black text-right"
                            >
                                {formatNumber(
                                    record && payee ? new Decimal(getAmountPrice(record!.amountType, record?.totalTTC, record?.totalHT)).minus(payee) : 0
                                )} {record?.company.currency}
                            </td>
                        </tr>
                    </tfoot>

                }
            </table>

            <div className="px-[27px] mt-[65px]" >
                <h3 style={{ marginBottom: "7px", fontWeight: 600, }}>
                    Message / remarques
                </h3>

                <p style={{ marginBottom: "3px", }}>
                    Campagne : {record?.company.companyName}
                </p>

                <h3 style={{ marginBottom: "3px" }}>NB :</h3>

                {record?.note && (
                    <pre
                        style={{
                            maxWidth: 400,
                            lineHeight: 1.5,
                            fontFamily: araboto.style?.fontFamily || "sans-serif",
                            fontSize: "0.75rem",
                            color: "#464646",
                            whiteSpace: "pre-wrap",
                            wordWrap: "break-word",
                            overflowWrap: "break-word"
                        }}
                    >
                        {record?.note}
                    </pre>
                )}
            </div>
        </div>
    );
}