'use client'

import { getLatestPurchaseOrder } from "@/action/purchase-order.action";
import Spinner from "@/components/ui/spinner";
import useQueryAction from "@/hook/useQueryAction";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RecentActivitiesBc() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderType[]>([])

  const companyId = useDataStore.use.currentCompany();
  const { mutate, isPending } = useQueryAction<
    { companyId: string },
    RequestResponse<PurchaseOrderType[]>
  >(getLatestPurchaseOrder, () => { }, "purchase-orders");

  useEffect(() => {
    if (companyId) {
      mutate({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setPurchaseOrders(data.data);
          }
        },
      })
    }
  }, [companyId])

  return (
    <div className="p-4 border border-neutral-200 rounded-lg space-y-4">
      <div className="flex justify-between">
        <h2 className="font-medium text-sm">Activitée récente</h2>
        <Link href="/purchase-order" className="text-sm text-neutral-600">
          Voir tout
        </Link>
      </div>
      {isPending ? <Spinner /> :
        <ul className="space-y-3">
          {purchaseOrders.map(purchaseOrder => (
            <li>
              <p className="text-sm flex gap-x-2 justify-between items-center text-neutral-700">
                <span>Facture n° {generateAmaId(purchaseOrder.purchaseOrderNumber, false)}</span>
                <span>{formatNumber(purchaseOrder.amountType === "TTC" ? purchaseOrder.totalTTC : purchaseOrder.totalHT)} {purchaseOrder.company.currency}</span>
              </p>
              <p className="text-xs text-neutral-600">{new Date(purchaseOrder.updatedAt).toLocaleDateString("fr-fr", {
                month: "long",
                day: "2-digit",
                year: "numeric"
              })} à {new Date(purchaseOrder.updatedAt).toLocaleTimeString("fr-fr", {
                hour: "2-digit",
                minute: "2-digit",
              })} </p>
            </li>

          ))}
        </ul>
      }
    </div>
  );
}
