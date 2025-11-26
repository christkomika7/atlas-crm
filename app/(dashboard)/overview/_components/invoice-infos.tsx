'use client';

import { expireInvoices, noExpireInvoices, noExpirePurchaseOrders } from "@/action/overview.action";
import { formatNumber } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { PaidInfosInvoiceType } from "@/types/invoice.types";
import { useEffect, useState } from "react";

import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";

type InvoiceInfosProps = {
  canViewDashboard: boolean
}

export default function InvoiceInfos({ canViewDashboard }: InvoiceInfosProps) {
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();

  const [invoiceExp, setInvoiceExp] = useState<PaidInfosInvoiceType>();
  const [invoiceNoExp, setInvoiceNoExp] = useState<PaidInfosInvoiceType>();
  const [purchaseOrderNoExp, setPurchaseOrderNoExp] = useState<PaidInfosInvoiceType>();


  const { mutate: mutateGetExpireInvoices, isPending: isGettingExpireInvoice } = useQueryAction<
    { companyId: string },
    RequestResponse<PaidInfosInvoiceType>
  >(expireInvoices, () => { }, "expire-invoice");

  const { mutate: mutateGetNoExpireInvoices, isPending: isGettingNoExpireInvoice } = useQueryAction<
    { companyId: string },
    RequestResponse<PaidInfosInvoiceType>
  >(noExpireInvoices, () => { }, "no-expire-invoice");

  const { mutate: mutateGetNoExpirePurchaseOrders, isPending: isGettingNoExpirePurchaseOrder } = useQueryAction<
    { companyId: string },
    RequestResponse<PaidInfosInvoiceType>
  >(noExpirePurchaseOrders, () => { }, "no-expire-purchase-order");


  useEffect(() => {
    if (companyId && canViewDashboard) {
      mutateGetExpireInvoices({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setInvoiceExp(data.data)
          }
        },
      });

      mutateGetNoExpireInvoices({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setInvoiceNoExp(data.data)
          }
        },
      });

      mutateGetNoExpirePurchaseOrders({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setPurchaseOrderNoExp(data.data)
          }
        },
      });

    }
  }, [companyId, canViewDashboard])
  return (
    <>
      {isGettingNoExpireInvoice || isGettingExpireInvoice || isGettingNoExpirePurchaseOrder ? <Spinner /> :
        <div className="p-4 border border-neutral-200 rounded-lg grid grid-cols-3">
          <div className="py-2 px-3">
            <h2 className="font-bold">{formatNumber(invoiceNoExp?.sumUnpaid || 0)} {currency}</h2>
            <p className="text-sm text-neutral-600 flex gap-x-1 items-center">
              Facture non soldé {String(invoiceNoExp?.percentageUnpaid || 0)}%
            </p>
          </div>

          <div className="py-2 px-3 border-x border-neutral-200">
            <h2 className="font-bold">{formatNumber(invoiceExp?.sumUnpaid || 0)} {currency}</h2>
            <p className="text-sm text-neutral-600 flex gap-x-1 items-center">
              Facture non soldé apres échéance  {String(invoiceExp?.percentageUnpaid || 0)}%
            </p>
          </div>
          <div className="py-2 px-3">
            <h2 className="font-bold">{formatNumber(purchaseOrderNoExp?.sumUnpaid || 0)} {currency}</h2>
            <p className="text-sm text-neutral-600 flex gap-x-1 items-center">
              Bon de commande non soldé {String(purchaseOrderNoExp?.percentageUnpaid || 0)}%
            </p>
          </div>
        </div>
      }
    </>
  );
}
