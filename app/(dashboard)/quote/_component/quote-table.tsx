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
import { dropdownMenu } from "./table";
import { checkDeadline, cutText, formatNumber, generateAmaId } from "@/lib/utils";
import { QuoteType } from "@/types/quote.types";
import { getAllQuotes } from "@/action/quote.action";
import { QUOTE_PREFIX } from "@/config/constant";

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
    const id = useDataStore.use.currentCompany();
    const currency = useDataStore.use.currency();
    const { mutate, isPending, data } = useQueryAction<
      { companyId: string; filter: "progress" | "complete" },
      RequestResponse<QuoteType[]>
    >(getAllQuotes, () => { }, "quotes");

    const toggleSelection = (quoteId: string, checked: boolean) => {
      setSelectedQuoteIds((prev) =>
        checked ? [...prev, quoteId] : prev.filter((id) => id !== quoteId)
      );
    };

    const refreshQuote = () => {
      if (id) {
        mutate({ companyId: id, filter });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshQuote,
    }));

    useEffect(() => {
      refreshQuote();
    }, [id]);

    const isSelected = (id: string) => selectedQuoteIds.includes(id);

    return (
      <div className="border border-neutral-200 rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
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
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((quote) => (
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
                      `${quote.client.firstname} ${quote.client.lastname}`,
                      20
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {new Date(quote.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
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
                      id={quote.id}
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
      </div>
    );
  }
);

QuoteTable.displayName = "QuoteTable";

export default QuoteTable;
