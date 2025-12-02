import { getAllQuotes } from "@/action/quote.action";
import { dropdownMenu } from "@/app/(dashboard)/quote/_component/table";
import TableActionButton from "@/app/(dashboard)/quote/_component/table-action-button";
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
import { DEFAULT_PAGE_SIZE, QUOTE_PREFIX } from "@/config/constant";
import { useAccess } from "@/hook/useAccess";
import useQueryAction from "@/hook/useQueryAction";
import { formatDateToDashModel } from "@/lib/date";
import { cutText, formatNumber, generateAmaId } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import useSearchStore from "@/stores/search.store";
import { RequestResponse } from "@/types/api.types";
import { QuoteType } from "@/types/quote.types";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export default function QuoteTab() {
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const id = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;

  const search = useSearchStore.use.search();

  const [debouncedSearch] = useDebounce(search, 500);


  const { access: readAccess, loading } = useAccess("QUOTES", "READ");

  const { mutate, isPending, data } = useQueryAction<
    { companyId: string; search?: string, skip?: number; take?: number },
    RequestResponse<QuoteType[]>
  >(getAllQuotes, () => { }, "quotes");


  const refreshQuote = (searchValue?: string) => {
    if (id && readAccess) {
      mutate({ companyId: id, search: searchValue, skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setQuotes(data.data);
            setTotalItems(data.total);
          }
        },
      });
    }
  };


  useEffect(() => {
    refreshQuote();
  }, [id, readAccess, currentPage]);

  useEffect(() => {
    refreshQuote(debouncedSearch)
  }, [readAccess, id, debouncedSearch])


  return (
    <AccessContainer hasAccess={readAccess} resource="QUOTES" loading={loading}>
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="font-medium text-center">N°</TableHead>
              <TableHead className="font-medium text-center">Client</TableHead>
              <TableHead className="font-medium text-center">Date</TableHead>
              <TableHead className="font-medium text-center">Montant</TableHead>
              <TableHead className="font-medium text-center">Mises à jour</TableHead>
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
            ) : quotes.length > 0 ? (
              quotes.map((quote) => (
                <TableRow
                  key={quote.id}
                  className={`h-16 transition-colors`}
                >
                  <TableCell className="text-neutral-600 text-center">
                    {quote.company?.documentModel?.quotesPrefix || QUOTE_PREFIX}-
                    {generateAmaId(quote.quoteNumber, false)}

                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(
                      `${quote.client.companyName}`,
                      20
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatDateToDashModel(quote.createdAt)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(quote.amountType === "TTC" ? quote.totalTTC : quote.totalHT)} {currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    <span>-</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      data={quote}
                      refreshQuotes={refreshQuote}
                      deleteTitle="Confirmer la suppression du rendez-vous"
                      deleteMessage={
                        <p>
                          En supprimant un devis, toutes les informations
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
                  Aucun devis trouvé.
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
