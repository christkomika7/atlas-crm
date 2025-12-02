import { all } from "@/action/invoice.action";
import { dropdownMenu } from "@/app/(dashboard)/invoice/_component/table";
import TableActionButton from "@/app/(dashboard)/invoice/_component/table-action-button";
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
import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import { useAccess } from "@/hook/useAccess";
import useQueryAction from "@/hook/useQueryAction";
import { paymentTerms } from "@/lib/data";
import { checkDeadline, formatDateToDashModel } from "@/lib/date";
import { cutText, formatNumber, generateAmaId } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import useSearchStore from "@/stores/search.store";
import { RequestResponse } from "@/types/api.types";
import { InvoiceType } from "@/types/invoice.types";
import { addDays } from "date-fns";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export default function InvoiceTab() {

  const [invoices, setInvoices] = useState<InvoiceType[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;

  const id = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();

  const search = useSearchStore.use.search();

  const [debouncedSearch] = useDebounce(search, 500);


  const { access: readAccess, loading } = useAccess("INVOICES", "READ");

  const { mutate: mutateGetInvoice, isPending: isGettingInvoices } = useQueryAction<
    { companyId: string; search: string, skip?: number; take?: number },
    RequestResponse<InvoiceType[]>
  >(all, () => { }, "invoices");


  const refreshInvoice = (searchValue?: string) => {
    if (id && readAccess) {
      mutateGetInvoice({ companyId: id, search: searchValue || "", skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setInvoices(data.data)
            setTotalItems(data.total ?? 0)
          }
        },
      });
    }
  };


  useEffect(() => {
    refreshInvoice();
  }, [id, currentPage, readAccess]);

  useEffect(() => {
    refreshInvoice(debouncedSearch)
  }, [readAccess, id, debouncedSearch])

  function dueDate(invoiceDate: Date, due: string) {
    const days = paymentTerms.find((p) => p.value === due)?.data ?? 0;
    const start = new Date(invoiceDate);
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
    <AccessContainer hasAccess={readAccess} resource="INVOICES" loading={loading} >
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="font-medium text-center">N°</TableHead>
              <TableHead className="font-medium text-center">Client</TableHead>
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">Montant</TableHead>
              <TableHead className="font-medium text-center">Échu</TableHead>
              <TableHead className="font-medium text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isGettingInvoices ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className={`h-16 transition-colors`}
                >
                  <TableCell className="text-neutral-600 text-center">
                    {invoice.company?.documentModel?.invoicesPrefix || "Facture"}-
                    {generateAmaId(invoice.invoiceNumber, false)}

                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(
                      `${invoice.client.companyName}`,
                      20
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatDateToDashModel(invoice.createdAt)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(invoice.amountType === "TTC" ? invoice.totalTTC : invoice.totalHT)} {currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    <span
                      className={
                        dueDate(invoice.createdAt, invoice.paymentLimit).color
                      }
                    >
                      {dueDate(invoice.createdAt, invoice.paymentLimit).text}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      data={invoice}
                      menus={dropdownMenu}
                      refreshInvoices={refreshInvoice}
                      deleteTitle="Confirmer la suppression de la facture"
                      deleteMessage={
                        <p>
                          En supprimant une facture, toutes les informations
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
                  Aucune facture trouvée.
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
