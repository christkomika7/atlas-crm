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
  useState,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import TableActionButton from "./table-action-button";
import { dropdownMenu } from "./table";
import { cutText, formatNumber, generateAmaId } from "@/lib/utils";
import { QuoteType } from "@/types/quote.types";
import { getAllQuotes } from "@/action/quote.action";
import { DEFAULT_PAGE_SIZE, QUOTE_PREFIX } from "@/config/constant";
import { formatDateToDashModel } from "@/lib/date";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import Paginations from "@/components/paginations";

type QuoteTableProps = {
  filter: "progress" | "complete";
  selectedQuoteIds: string[];
  setSelectedQuoteIds: Dispatch<SetStateAction<string[]>>;
};

export interface QuoteTableRef {
  refreshQuote: () => void;
}

const QuoteTable = forwardRef<QuoteTableRef, QuoteTableProps>(
  ({ selectedQuoteIds, setSelectedQuoteIds, filter }, ref) => {
    const [quotes, setQuotes] = useState<QuoteType[]>([]);
    const id = useDataStore.use.currentCompany();
    const currency = useDataStore.use.currency();

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [totalItems, setTotalItems] = useState<number>(0);

    const skip = (currentPage - 1) * pageSize;

    const { access: readAccess, loading } = useAccess("QUOTES", "READ");

    const { mutate, isPending } = useQueryAction<
      { companyId: string; filter: "progress" | "complete", skip?: number; take?: number },
      RequestResponse<QuoteType[]>
    >(getAllQuotes, () => { }, "quotes");

    const toggleSelection = (quoteId: string, checked: boolean) => {
      setSelectedQuoteIds((prev) =>
        checked ? [...prev, quoteId] : prev.filter((id) => id !== quoteId)
      );
    };

    const refreshQuote = () => {
      if (id && readAccess) {
        mutate({ companyId: id, filter, skip, take: pageSize }, {
          onSuccess(data) {
            if (data.data) {
              setQuotes(data.data);
              setTotalItems(data.total);
            }
          },
        });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshQuote,
    }));

    useEffect(() => {
      refreshQuote();
    }, [id, readAccess, currentPage]);

    const isSelected = (id: string) => selectedQuoteIds.includes(id);

    return (
      <AccessContainer hasAccess={readAccess} resource="QUOTES" loading={loading}>
        <div className="border border-neutral-200 rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="h-14">
                <TableHead className="min-w-12.5 font-medium" />
                <TableHead className="font-medium text-center">N°</TableHead>
                <TableHead className="font-medium text-center">Client</TableHead>
                <TableHead className="font-medium text-center">Date</TableHead>
                <TableHead className="font-medium text-center">Montant</TableHead>
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
                    className={`h-16 transition-colors ${isSelected(quote.id) ? "bg-neutral-100" : ""
                      }`}
                  >
                    <TableCell className="text-neutral-600">
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={isSelected(quote.id)}
                          onCheckedChange={(checked) =>
                            toggleSelection(quote.id, !!checked)
                          }
                        />
                      </div>
                    </TableCell>
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
);

QuoteTable.displayName = "QuoteTable";

export default QuoteTable;
