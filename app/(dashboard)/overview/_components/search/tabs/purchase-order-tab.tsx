import { dropdownMenu } from "@/app/(dashboard)/purchase-order/_component/table";
import TableActionButton from "@/app/(dashboard)/purchase-order/_component/table-action-button";
import AccessContainer from "@/components/errors/access-container";
import Paginations from "@/components/paginations";
import Spinner from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_SIZE, PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { cutText, formatNumber, generateAmaId } from "@/lib/utils";
import { addDays } from "date-fns";
import { checkDeadline, formatDateToDashModel } from "@/lib/date";
import { useEffect, useState } from "react";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { useDataStore } from "@/stores/data.store";
import { useAccess } from "@/hook/useAccess";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { all } from "@/action/purchase-order.action";
import useSearchStore from "@/stores/search.store";
import { useDebounce } from "use-debounce";
import { paymentTerms } from "@/lib/data";

export default function PurchaseOrderTab() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderType[]>([]);
  const id = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();


  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;

  const search = useSearchStore.use.search();

  const [debouncedSearch] = useDebounce(search, 500);

  const { access: readAccess, loading } = useAccess("PURCHASE_ORDER", "READ");

  const { mutate, isPending } = useQueryAction<
    { companyId: string, search?: string, skip?: number; take?: number },
    RequestResponse<PurchaseOrderType[]>
  >(all, () => { }, "purchase-order");

  const refreshPurchaseOrder = (searchValue?: string) => {
    if (id && readAccess) {
      mutate({ companyId: id, search: searchValue, skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setPurchaseOrders(data.data);
            setTotalItems(data.total);
          }
        },
      });
    }
  };

  useEffect(() => {
    refreshPurchaseOrder();
  }, [id, readAccess, currentPage]);

  useEffect(() => {
    refreshPurchaseOrder(debouncedSearch)
  }, [readAccess, id, debouncedSearch])


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
    <AccessContainer hasAccess={readAccess} resource="PURCHASE_ORDER" loading={loading}>
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
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
            ) : purchaseOrders.length > 0 ? (
              purchaseOrders.map((purchaseOrder) => (
                <TableRow
                  key={purchaseOrder.id}
                  className="h-16 transition-colors"
                >
                  <TableCell className="text-neutral-600 text-center">
                    {purchaseOrder.company?.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-
                    {generateAmaId(purchaseOrder.purchaseOrderNumber, false)}

                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(
                      `${purchaseOrder.supplier.companyName}`,
                      20
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatDateToDashModel(purchaseOrder.createdAt)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(purchaseOrder.amountType === "TTC" ? purchaseOrder.totalTTC : purchaseOrder.totalHT)} {currency}
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
        <div className="flex justify-end p-4">
          <Paginations
            totalItems={totalItems}
            pageSize={pageSize}
            controlledPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisiblePages={DEFAULT_PAGE_SIZE}
          />
        </div>
      </div>
    </AccessContainer>
  );
}
