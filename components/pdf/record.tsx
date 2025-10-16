import Spinner from "@/components/ui/spinner";
import { generalSans } from "@/fonts/font";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import { formatDateToDashModel } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import { cn, formatNumber, getAmountPrice, parseItem, parseItems, resolveImageSrc } from "@/lib/utils";
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
    logo?: File;
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

// Type guard pour vérifier si c'est un PurchaseOrder
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
    orderNote,
    isLoading,
    record,
    id,
    recordNumber,
    supplier,
    payee,
    moreInfos = true
}: DocumentPreviewProps) {
    const [logoURL, setLogoURL] = useState<string | null>(null);

    const { calculate } = useCalculateTaxe();

    useEffect(() => {
        if (logo && logo instanceof File) {
            setLogoURL(resolveImageSrc(logo) as string);
        } else {
            setLogoURL(null);
        }
    }, [logo]);

    // Fonction pour récupérer les infos du destinataire
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
        <div id={id} className="py-8">
            <div
                className="flex w-full h-[250px] px-8"
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
                        "relative flex justify-center items-center object-center object-contain",
                        logoSize === "Small" && "h-[80px]",
                        logoSize === "Medium" && "h-[120px]",
                        logoSize === "Large" && "h-[160px]"
                    )}
                >
                    {logoURL ? (
                        <Image
                            src={logoURL}
                            alt="Logo"
                            width={160}
                            height={160}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <h2 className="font-bold text-4xl">LOGO</h2>
                    )}
                </div>
            </div>
            <div
                className="w-full h-2"
                style={{
                    backgroundColor: firstColor,
                }}
            ></div>
            <div
                className="relative flex justify-between gap-x-2 mb-9 py-6 px-3"
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

                <div style={{ display: "flex", flexDirection: "column" }}>
                    <p style={{ display: "grid", gridTemplateColumns: "80px 1fr", columnGap: "8px", marginBottom: "-1px", color: "#000", fontSize: "0.875rem" }}>
                        <span style={{ fontWeight: 600 }}>{type} N° :</span>
                        <span style={{ fontWeight: 500 }}>{orderValue}-{recordNumber}</span>
                    </p>

                    <p style={{ display: "grid", gridTemplateColumns: "80px 1fr", columnGap: "8px", marginBottom: "-1px", color: "#000", fontSize: "0.875rem" }}>
                        <span style={{ fontWeight: 600 }}>Date :</span>
                        <span style={{ fontWeight: 500 }}>
                            {record?.updatedAt ? formatDateToDashModel(new Date(record.updatedAt)) : formatDateToDashModel(new Date())}
                        </span>
                    </p>

                    <p style={{ display: "grid", gridTemplateColumns: "80px 1fr", columnGap: "8px", color: "#000", fontSize: "0.875rem" }}>
                        <span style={{ fontWeight: 600 }}>À :</span>
                        <span style={{ fontWeight: 500 }}>
                            {recipientInfo.companyName} <br />
                            {recipientInfo.email} <br />
                            {recipientInfo.address}
                        </span>
                    </p>
                </div>

                <div className="space-y-1.5">
                    <h2 className="font-semibold text-black text-xl text-right">
                        {title}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", }}>
                        <p style={{ color: "#000", fontSize: "0.875rem", marginBottom: "-1px", textAlign: "right" }}>
                            {record?.company.registeredAddress}
                        </p>
                        <p style={{ color: "#000", fontSize: "0.875rem", marginBottom: "-1px", textAlign: "right" }}>
                            BP: {record?.company.codePostal}
                        </p>
                        <p style={{ color: "#000", fontSize: "0.875rem", marginBottom: "-1px", textAlign: "right" }}>
                            {record?.company.city},{" "}
                            {getCountryFrenchName(record?.company.country as string)}
                        </p>
                        <p style={{ color: "#000", fontSize: "0.875rem", marginBottom: "-1px", textAlign: "right" }}>
                            {record?.company.email}
                        </p>
                        {record?.company.website && (
                            <p style={{ color: "#000", fontSize: "0.875rem", marginBottom: "-1px", textAlign: "right" }}>
                                <Link href={record?.company.website}>
                                    {record?.company.website}
                                </Link>
                            </p>
                        )}
                        <p style={{ color: "#000", fontSize: "0.875rem", marginBottom: "-1px", textAlign: "right" }}>
                            {record?.company.phoneNumber}
                        </p>
                        <p style={{ color: "#000", fontSize: "0.875rem", marginBottom: "-1px", textAlign: "right" }}>
                            RCCM: {record?.company.businessRegistrationNumber}
                        </p>
                        <p style={{ color: "#000", fontSize: "0.875rem", textAlign: "right" }}>
                            NIF: {record?.company.taxIdentificationNumber}
                        </p>
                    </div>
                </div>
            </div>

            <table className="w-full px-8">
                <thead className="h-10">
                    <tr className="border-y w-full">
                        <td className="px-3 font-semibold text-sm">Article</td>
                        <td className="w-[50px] font-semibold text-sm text-right">
                            Qté
                        </td>
                        <td className="w-[150px] font-semibold text-sm text-right">
                            Prix unitaire
                        </td>
                        <td className="w-[180px] pr-3 font-semibold text-sm text-right">
                            Prix total
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {record?.items.map((item) => (
                        <tr className={cn("text-sm h-full")} key={item.id}>
                            <td className="px-3 py-2">
                                <div className="flex flex-col space-y-2">
                                    <span>{item.name}</span>
                                    <pre className={`${generalSans.className} whitespace-pre-wrap mb-2 leading-tight text-sm`}>{item.description}</pre>
                                </div>
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
                                                taxes: record.company?.vatRates ?? []
                                            }).totalWithoutTaxes
                                        )}{" "}
                                        {item.currency}
                                    </>
                                }
                            </td>
                            <td className="py-2 text-right pr-3 align-top">
                                {moreInfos && <>
                                    {formatNumber(
                                        calculate({
                                            items: [parseItem(item)],
                                            taxes: record.company?.vatRates ?? [],
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
                        <tr className="h-6"></tr>
                        <tr className="text-sm">
                            <td colSpan={3} className="text-right">
                                Sous-total
                            </td>
                            <td className="pr-3 text-right">{formatNumber(getAmountPrice(record!.amountType, record?.totalTTC, record?.totalHT))} {record?.company.currency}</td>
                        </tr>
                        <tr className="text-sm">
                            <td colSpan={3} className="text-right">
                                Remise ({record?.discountType === "money" ? `${formatNumber(record!.discount)} ${record?.company?.currency}` : `${record!.discount}%`})
                            </td>
                            <td className="pr-3 text-right">
                                {record?.discountType === "money" ? `${formatNumber(record!.discount)} ${record?.company?.currency}` : `${formatNumber(new Decimal(getAmountPrice(record!.amountType, record?.totalTTC, record?.totalHT)).mul(record!.discount).div(100))}`}
                                {" "}{record?.company.currency}
                            </td>
                        </tr>
                        {calculate({
                            items: (record ? (parseItems(record.items)) : []),
                            taxes: record?.company?.vatRates ?? [],
                        }).taxes.map((tax) => (
                            <tr key={tax.taxName} className="text-sm">
                                <td colSpan={3} className="text-right">
                                    {tax.taxName} </td>
                                <td className="pr-3 text-right">  {formatNumber(tax.totalTax)} {record?.company?.currency}</td>
                            </tr>
                        ))}
                        {record?.amountType === "TTC" &&
                            <tr className="text-sm">
                                <td colSpan={3} className="text-right">
                                    Total TTC
                                </td>
                                <td className="pr-3 text-right">{formatNumber(record!.totalTTC)} {record?.company.currency}</td>
                            </tr>
                        }

                        <tr className="h-4"></tr>
                        {payee &&
                            <tr className="text-sm">
                                <td colSpan={3} className="text-right">
                                    Payé
                                </td>
                                <td className="pr-3 text-right">{formatNumber(payee)} {record?.company.currency}</td>
                            </tr>
                        }
                        <tr className="h-1"></tr>
                        <tr className="text-sm">
                            <td></td>
                            <td></td>
                            <td
                                style={{
                                    backgroundColor: secondColor,
                                }}
                                className="py-3 font-semibold text-right"
                            >
                                Net à payer
                            </td>
                            <td
                                style={{
                                    backgroundColor: secondColor,
                                }}
                                className="pr-3 font-semibold text-right"
                            >
                                {formatNumber(
                                    record && payee ? new Decimal(getAmountPrice(record!.amountType, record?.totalTTC, record?.totalHT)).minus(payee) : 0
                                )} {record?.company.currency}
                            </td>
                        </tr>
                    </tfoot>

                }
            </table>

            <div style={{ padding: "12px 10px" }}>
                <h3 style={{ marginBottom: "1px", fontWeight: 600, fontSize: "0.875rem" }}>
                    Message / remarques
                </h3>

                <p style={{ marginBottom: "2px", fontSize: "0.875rem" }}>
                    Campagne : {record?.company.companyName}
                </p>

                {orderNote && (
                    <pre
                        style={{
                            fontFamily: generalSans.style?.fontFamily || "sans-serif",
                            fontSize: "0.875rem", lineHeight: 1.3
                        }}
                    >
                        {orderNote}
                    </pre>
                )}
            </div>
        </div>
    );
}