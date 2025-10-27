"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

import { useEffect, useState } from "react";

import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { formatDateToDashModel } from "@/lib/date";
import { useParams } from "next/navigation";
import Decimal from "decimal.js";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { getPurchaseOrder } from "@/action/supplier.action";
import TableActionButton from "@/app/(dashboard)/purchase-order/_component/table-action-button";
import { dropdownMenu } from "@/app/(dashboard)/purchase-order/_component/table";

export default function ActivityTab() {
  const supplier = useParams();
  const currency = useDataStore.use.currency();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderType[]>([]);

  const ids = useDataStore.use.ids();
  const addId = useDataStore.use.addId();
  const removeId = useDataStore.use.removeId();

  const { mutate: mutateGetPurchaseOrder, isPending: isGettingPurchaseOrdeer } = useQueryAction<
    { id: string },
    RequestResponse<PurchaseOrderType[]>
  >(getPurchaseOrder, () => { }, "purchase-orders");


  useEffect(() => {
    refreshPurchaseOrder();
  }, [supplier?.id]);

  function refreshPurchaseOrder() {
    if (supplier?.id) {
      mutateGetPurchaseOrder({ id: supplier.id as string }, {
        onSuccess(data) {
          if (data.data) {
            setPurchaseOrders(data.data);
          }
        },
      });
    }
  }

  const toggleSelection = (purchaseOrderId: string) => {
    if (ids.includes(purchaseOrderId)) {
      removeId(purchaseOrderId);
    } else {
      addId(purchaseOrderId);
    }
  };

  const isSelected = (id: string) => ids.includes(id);

  return (
    <div className="border border-neutral-200 rounded-xl">
      <Table>
        <TableHeader>
          <TableRow className="h-14">
            <TableHead className="min-w-[50px] font-medium text-center">
              Sélection
            </TableHead>
            <TableHead className="font-medium text-center">
              Numéro du document
            </TableHead>
            <TableHead className="font-medium text-center">
              Date du document
            </TableHead>
            <TableHead className="font-medium text-center">
              Montant du document
            </TableHead>
            <TableHead className="font-medium text-center">
              Déjà payé
            </TableHead>
            <TableHead className="font-medium text-center">
              Montant en retard
            </TableHead>
            <TableHead className="font-medium text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isGettingPurchaseOrdeer ? (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="flex justify-center items-center py-6 w-full">
                  <Spinner />
                </div>
              </TableCell>
            </TableRow>
          ) : purchaseOrders.length > 0 ? (
            purchaseOrders.map((purchaseOrder) => (
              <TableRow
                key={purchaseOrder.id}
                className={`h-16 transition-colors ${isSelected(purchaseOrder.id) ? "bg-neutral-100" : ""}`}
              >
                <TableCell className="text-neutral-600">
                  <div className="flex justify-center items-center">
                    <Checkbox
                      checked={isSelected(purchaseOrder.id)}
                      onCheckedChange={() => toggleSelection(purchaseOrder.id)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {purchaseOrder.company.documentModel.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-{generateAmaId(purchaseOrder.purchaseOrderNumber, false)}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatDateToDashModel(purchaseOrder.createdAt)}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {purchaseOrder.amountType === "TTC" ? formatNumber(purchaseOrder.totalTTC) : formatNumber(purchaseOrder.totalHT)} {currency}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatNumber(purchaseOrder.payee)} {currency}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatNumber(
                    purchaseOrder.amountType === "TTC"
                      ? new Decimal(purchaseOrder.totalTTC).minus(purchaseOrder.payee)
                      : new Decimal(purchaseOrder.totalHT).minus(purchaseOrder.payee)
                  )} {currency}
                </TableCell>
                <TableCell className="text-center">
                  <TableActionButton
                    menus={dropdownMenu}
                    id={purchaseOrder.id}
                    refreshPurchaseOrder={refreshPurchaseOrder}
                    deleteTitle="Confirmer la suppression du bon de commande"
                    deleteMessage={
                      <p>
                        En supprimant ce bon de commande, toutes les informations liées
                        seront également supprimées.
                        <br />
                        <span className="font-semibold text-red-600">
                          Cette action est irréversible.
                        </span>
                        <br />
                        <br />
                        Confirmez-vous cette suppression ?
                      </p>
                    }
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-6 text-gray-500 text-sm text-center"
              >
                Aucun bon de commande trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
