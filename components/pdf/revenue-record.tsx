import Spinner from "@/components/ui/spinner";
import { araboto } from "@/fonts/font";
import { formatDateToDashModel } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import { cn, formatNumber, resolveImageSrc, urlToFile } from "@/lib/utils";
import { RevenueType } from "@/types/client.types";
import { SupplierRevenueType } from "@/types/supplier.types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type RevenueRecordProps = {
    id: string;
    type: string;
    firstColor: string;
    secondColor: string;
    logo?: string;
    logoSize?: string;
    logoPosition?: string;
    revenue: RevenueType | SupplierRevenueType;
    isLoading: boolean;
};



export default function RevenueRecord({
    type,
    firstColor,
    secondColor,
    logo,
    logoSize,
    logoPosition,
    id,
    revenue,
    isLoading
}: RevenueRecordProps) {
    const partner = type === "supplier-revenue-record" ? (revenue as SupplierRevenueType).supplier : (revenue as RevenueType).client;
    const datas = type === "supplier-revenue-record" ? (revenue as SupplierRevenueType).purchaseOrders : (revenue as RevenueType).invoices;
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

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

    if (isLoading && !revenue) return <Spinner />;

    return (
        <div id={id} className="py-8 min-w-[595px]" style={{
            fontFamily: araboto.style?.fontFamily || "sans-serif",
            fontSize: "0.75rem",
            color: "#464646",
            lineHeight: 1.5
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

                    <p style={{ display: "grid", gridTemplateColumns: "80px 1fr", columnGap: "69px", marginBottom: "1px", }}>
                        <span className="font-medium">Date :</span>
                        <span className="font-normal">
                            {formatDateToDashModel(new Date())}
                        </span>
                    </p>

                    <p style={{ display: "grid", gridTemplateColumns: "80px 1fr", columnGap: "69px", }}>
                        <span className="font-medium">À :</span>
                        <span className="font-normal">
                            {partner?.companyName} <br />
                            {partner?.email} <br />
                            {partner?.address}
                        </span>
                    </p>
                    <p style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr",
                        columnGap: "69px",
                        marginBottom: "1px",

                    }}>
                        <span className="font-medium">Résumé :</span>
                        <span className="font-normal flex flex-col">
                            <span>Factures: {formatNumber(revenue?.totalTTC?.toString() || 0)} {partner?.company?.currency}</span>
                            <span>Paiements: {formatNumber(revenue?.totalDue?.toString() || 0)} {partner?.company?.currency}</span>
                            <span>Soldes: {formatNumber(revenue?.totalPaid?.toString() || 0)} {partner?.company?.currency}</span>
                        </span>
                    </p>
                </div>

                <div >
                    <h2 className="font-black !text-[1.275rem] mb-[12px] text-right">
                        Relevé
                    </h2>
                    <div className="">
                        <p className="text-right mb-[1px]">
                            {partner?.company?.registeredAddress}
                        </p>
                        <p className="mb-[1px] text-right">
                            BP: {partner?.company?.codePostal}
                        </p>
                        <p className="mb-[1px] text-right">
                            {partner?.company?.city},{" "}
                            {getCountryFrenchName(partner?.company?.country as string)}
                        </p>
                        <p className="mb-[1px] text-right">
                            {partner?.company?.email}
                        </p>
                        {partner?.company?.website && (
                            <p className="mb-[1px] text-right">
                                <Link href={partner?.company?.website}>
                                    {partner?.company?.website}
                                </Link>
                            </p>
                        )}
                        <p className="mb-[1px] text-right">
                            {partner?.company?.phoneNumber}
                        </p>
                        <p className="mb-[1px] text-right">
                            RCCM: {partner?.company?.businessRegistrationNumber}
                        </p>
                        <p className="text-right">
                            NIF: {partner?.company?.taxIdentificationNumber}
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-center my-3"> {type === "supplier-revenue-record" ? "Tous les bons de commandes " : "Toutes les factures "} du {formatDateToDashModel(revenue?.startDate)} au {formatDateToDashModel(revenue?.endDate)}</p>
            <table className="w-full px-8">
                <thead className="h-12">
                    <tr className="!border-y border-[#bfbfbf] w-full">
                        <td className="pl-[27px] font-semibold">Date</td>
                        <td className="w-[340px] font-bold text-right">
                            Infos
                        </td>
                        <td className="w-[150px] font-bold text-right">
                            Montant
                        </td>
                        <td className="w-[150px] font-bold text-right">
                            Réglé
                        </td>
                        <td className="w-[200px] pr-[27px] font-bold text-right">
                            Solde
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr key={0}>
                        <td className="px-[27px] py-2 align-top">
                            {formatDateToDashModel(revenue?.startDate)}
                        </td>
                        <td className="py-2 text-right align-top">
                            Solde de départ
                        </td>
                        <td className="py-2 text-right align-top">
                        </td>
                        <td className="py-2 text-right align-top">
                        </td>
                        <td className="py-2 pr-[27px] text-right align-top">
                            {formatNumber(revenue?.initialBalance?.toString() || 0)} {partner?.company?.currency}
                        </td>
                    </tr>
                    {datas.map((data, index) => (
                        <tr key={index + 1}>
                            <td className="px-[27px] py-2 align-top">
                                {formatDateToDashModel(revenue?.endDate)}
                            </td>
                            <td className="py-2 text-right align-top">
                                <span className="font-medium">{data.reference}</span> - Échéance {formatDateToDashModel(data.echeance.dayEnd)} <span className={cn(data.echeance.color)}>({data.echeance.text === "Expiré" ? "en retard" : "en cour"})</span>
                            </td>
                            <td className="py-2 text-right align-top">
                                {formatNumber(data.totalTTC?.toString() || 0)} {partner?.company?.currency}
                            </td>
                            <td className="py-2 text-right align-top">
                                {formatNumber(data.payee?.toString() || 0)} {partner?.company?.currency}
                            </td>
                            <td className="py-2 text-right align-top pr-[27px]">
                                {formatNumber(Number(data.totalTTC?.toString() || 0) - Number(data.payee?.toString() || 0))} {partner?.company?.currency}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-end items-center">
                <div
                    style={{
                        backgroundColor: secondColor,
                    }}
                    className="py-3 text-2xl font-black text-right px-[27px] flex gap-x-12 mb-12 mt-2 w-fit"
                >
                    <h2>Net à payer :</h2>
                    <p>{formatNumber(revenue?.totalTTC?.toString() || 0)} {partner?.company?.currency}</p>
                </div>
            </div>


            <table className="w-full px-8">
                <thead className="h-12">
                    <tr className="!border-y border-[#bfbfbf] w-full">
                        <td className="pl-[27px] font-semibold">Payable à ce jour</td>
                        <td className="font-bold text-right">
                            1 à 30 jours de retard
                        </td>
                        <td className="font-bold text-right">
                            31 à 60 jours de retard
                        </td>
                        <td className="font-bold text-right">
                            61 à 90 jours de retard
                        </td>
                        <td className="pr-[27px] font-bold text-right">
                            + de 91 jours de retard
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="px-[27px] py-2 align-top">
                            {formatNumber(revenue?.payableToday?.toString() || 0)} {partner?.company.currency}
                        </td>
                        <td className="py-2 text-right align-top">
                            {formatNumber(revenue?.delay1to30?.toString() || 0)} {partner?.company.currency}
                        </td>
                        <td className="py-2 text-right align-top">
                            {formatNumber(revenue?.delay31to60?.toString() || 0)} {partner?.company.currency}
                        </td>
                        <td className="py-2 text-right align-top">
                            {formatNumber(revenue?.delay61to90?.toString() || 0)} {partner?.company.currency}
                        </td>
                        <td className="py-2 text-right align-top pr-[27px]">
                            {formatNumber(revenue?.delayOver91?.toString() || 0)} {partner?.company.currency}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}