"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import TableActionButton from "./table-action-button";
import { all } from "@/action/purchase-order.action";
import { dropdownMenu } from "./table";
import { cutText, formatNumber, generateAmaId } from "@/lib/utils";
import { paymentTerms } from "@/lib/data";
import { addDays } from "date-fns";
import { checkDeadline } from "@/lib/date";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";

type PurchaseOrderTableProps = {
  filter: "unpaid" | "paid";
  selectedPurchaseOrderIds: string[];
  setSelectedPurchaseOrderIds: Dispatch<SetStateAction<string[]>>;
};

export interface PurchaseOrderTableRef {
  refreshPurchaseOrder: () => void;
}

const PurchaseOrderTable = forwardRef<PurchaseOrderTableRef, PurchaseOrderTableProps>(
  ({ selectedPurchaseOrderIds, setSelectedPurchaseOrderIds, filter }, ref) => {
    const id = useDataStore.use.currentCompany();
    const currency = useDataStore.use.currency();

    const { mutate, isPending, data } = useQueryAction<
      { companyId: string; filter: "unpaid" | "paid" },
      RequestResponse<PurchaseOrderType[]>
    >(all, () => { }, "purchase-order");

    const toggleSelection = (purchaseOrderId: string, checked: boolean) => {
      setSelectedPurchaseOrderIds((prev) =>
        checked ? [...prev, purchaseOrderId] : prev.filter((id) => id !== purchaseOrderId)
      );
    };

    const refreshPurchaseOrder = () => {
      if (id) {
        mutate({ companyId: id, filter });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshPurchaseOrder,
    }));

    useEffect(() => {
      refreshPurchaseOrder();
    }, [id]);

    const isSelected = (id: string) => selectedPurchaseOrderIds.includes(id);

    function dueDate(purchaseOrderDate: Date, due: string) {
      const days = paymentTerms.find((p) => p.value === due)?.data ?? 0;
      const start = new Date(purchaseOrderDate);
      const end = addDays(start, days);
      const status = checkDeadline([start, end]);
      if (status.isOutside) return {
        color: "text-red-600",
        text: "Expiré"
      }
      return {
        color: 'text-green-600',
        text: `${status.daysLeft} jour${status.daysLeft > 1 ? 's' : ''}`
      }
    }


    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">N°</TableHead>
              <TableHead className="font-medium text-center">Fournisseur</TableHead>
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">Montant</TableHead>
              <TableHead className="font-medium text-center">Échu</TableHead>
              <TableHead className="font-medium text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((purchaseOrder) => (
                <TableRow
                  key={purchaseOrder.id}
                  className={`h-16 transition-colors ${isSelected(purchaseOrder.id) ? "bg-neutral-100" : ""
                    }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(purchaseOrder.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(purchaseOrder.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {purchaseOrder.company?.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-
                    {generateAmaId(purchaseOrder.purchaseOrderNumber, false)}

                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(
                      `${purchaseOrder.supplier.firstname} ${purchaseOrder.supplier.lastname}`,
                      20
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {new Date(purchaseOrder.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(purchaseOrder.totalTTC)} {currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    <span
                      className={
                        dueDate(purchaseOrder.createdAt, purchaseOrder.paymentLimit).color
                      }
                    >
                      {dueDate(purchaseOrder.createdAt, purchaseOrder.paymentLimit).text}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={purchaseOrder.id}
                      refreshPurchaseOrder={refreshPurchaseOrder}
                      deleteTitle="Confirmer la suppression du bon de commande"
                      deleteMessage={
                        <p>
                          En supprimant le bon de commande, toutes les informations
                          liées seront également supprimées.
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
                  colSpan={9}
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
);

PurchaseOrderTable.displayName = "PurchaseOrderTable";

export default PurchaseOrderTable;
