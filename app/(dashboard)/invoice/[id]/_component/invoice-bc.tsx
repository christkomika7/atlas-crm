import Spinner from "@/components/ui/spinner";
import { generalSans } from "@/fonts/font";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import { formatDateToDashModel } from "@/lib/date";
import { getCountryFrenchName } from "@/lib/helper";
import { calculateTaxes } from "@/lib/price";
import { cn, formatNumber, generateAmaId, resolveImageSrc } from "@/lib/utils";
import { ItemType } from "@/stores/item.store";
import { InvoiceType } from "@/types/invoice.types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type DocumentPreviewProps = {
  id: string;
  firstColor: string;
  secondColor: string;
  logo?: File;
  logoSize?: string;
  logoPosition?: string;
  orderValue: string;
  orderNote: string;
  invoice?: InvoiceType;
  isLoading?: boolean;
};

export default function InvoiceBC({
  firstColor,
  secondColor,
  logo,
  logoSize,
  logoPosition,
  orderValue,
  orderNote,
  isLoading,
  invoice,
  id
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

  if (isLoading && !invoice) return <Spinner />;

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
        className="w-full h-2 px-8"
        style={{
          backgroundColor: firstColor,
        }}
      ></div>
      <div
        className="relative flex justify-between gap-x-2 mb-9 py-6 px-8"
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

        <div className="space-y-0.5">
          <p className="gap-x-2 grid grid-cols-[60px_1fr] text-neutral-600 text-sm">
            <span className="font-semibold">BC N° :</span>
            <span className="font-medium">{orderValue}-{generateAmaId(invoice?.invoiceNumber ?? 1, false)}</span>
          </p>
          <p className="gap-x-2 grid grid-cols-[60px_1fr] text-neutral-600 text-sm">
            <span className="font-semibold">Date :</span>
            <span className="font-medium">{invoice?.updatedAt ? formatDateToDashModel(new Date(invoice.updatedAt)) : formatDateToDashModel(new Date())}</span>
          </p>
          <p className="gap-x-2 grid grid-cols-[60px_1fr] text-neutral-600 text-sm">
            <span className="font-semibold">À :</span>
            <span className="font-medium">
              {invoice?.client.companyName} <br />
              {invoice?.client.email} <br />
              {invoice?.client.address}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-neutral-700 text-xl text-right">
            Bon de commande
          </h2>
          <div className="space-y-0.5">
            <p className="text-neutral-600 text-sm text-right">
              {invoice?.company.registeredAddress}
            </p>
            <p className="text-neutral-600 text-sm text-right">BP: {invoice?.company.codePostal}</p>
            <p className="text-neutral-600 text-sm text-right">
              {invoice?.company.city},{" "}
              {getCountryFrenchName(invoice?.company.country as string)}
            </p>
            <p className="text-neutral-600 text-sm text-right">
              {invoice?.company.email}
            </p>
            {invoice?.company.website &&
              <p className="text-neutral-600 text-sm text-right">
                <Link href={invoice?.company.website}>
                  {invoice?.company.website}
                </Link>
              </p>
            }
            <p className="text-neutral-600 text-sm text-right">{invoice?.company.phoneNumber}</p>
            <p className="text-neutral-600 text-sm text-right">
              RCCM: {invoice?.company.businessRegistrationNumber}
            </p>
            <p className="text-neutral-600 text-sm text-right">
              NIF: {invoice?.company.taxIdentificationNumber}
            </p>
          </div>
        </div>
      </div>

      <table className="w-full px-8">
        <thead className="h-10">
          <tr className="border-y w-full">
            <td className="px-3 font-semibold text-sm">Article</td>
            <td className="px-3 w-[70px] font-semibold text-sm text-right">
              Quantité
            </td>
            <td className="px-3 w-[140px] font-semibold text-sm text-right">
              Prix unitaire
            </td>
            <td className="px-3 w-[140px] font-semibold text-sm text-right">
              Prix total
            </td>
          </tr>
        </thead>
        <tbody>
          {invoice?.items.map((item) => (
            <tr className="text-sm" key={item.id}>
              <td className="px-3 py-2">{item.name}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">
                {formatNumber(
                  calculate({
                    items: [item as ItemType],
                    taxes: invoice.company?.vatRates ?? []
                  }).totalWithoutTaxes
                )}{" "}
                {item.currency}
              </td>
              <td className="py-2 pr-3 text-right">
                {formatNumber(
                  calculate({
                    items: [item as ItemType],
                    taxes: invoice.company?.vatRates ?? [],
                  }).totalWithoutTaxes
                )}
                {" "}
                {item.currency}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="text-sm">
            <td colSpan={3} className="pr-10 text-right">
              total HT
            </td>
            <td className="pr-3 text-right">{formatNumber(invoice!.totalHT)} {invoice?.company.currency}</td>
          </tr>
          {calculate({
            items: (invoice ? (invoice.items as ItemType[]) : []),
            taxes: invoice?.company?.vatRates ?? [],
          }).taxes.map((tax) => (
            <tr key={tax.taxName} className="text-sm">
              <td colSpan={3} className="pr-10 text-right">
                {tax.taxName} </td>
              <td className="pr-3 text-right">  {formatNumber(tax.totalTax)} {invoice?.company?.currency}</td>
            </tr>
          ))}
          <tr className="h-4"></tr>
          <tr className="text-sm">
            <td></td>
            <td></td>
            <td
              style={{
                backgroundColor: secondColor,
              }}
              className="py-3 pr-10 font-semibold text-right"
            >
              Total général
            </td>
            <td
              style={{
                backgroundColor: secondColor,
              }}
              className="pr-3 font-semibold text-right"
            >
              {formatNumber(invoice?.totalTTC ?? 0)} {invoice?.company.currency}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="py-3 px-8">
        <h3 className="mb-1 font-semibold text-sm">Message / remarques</h3>
        <p className="mb-2 text-sm">Campagne : {invoice?.company.companyName}</p>

        {orderNote &&
          <pre className={`${generalSans.className} text-sm`}>
            {orderNote}
          </pre>
        }
      </div>
    </div>
  );
}
