"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { getQuote } from "@/action/client.action";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { QUOTE_PREFIX } from "@/config/constant";
import { formatDateToDashModel } from "@/lib/date";
import { useParams } from "next/navigation";
import { QuoteType } from "@/types/quote.types";
import TableActionButton from "@/app/(dashboard)/quote/_component/table-action-button";
import { dropdownMenu } from "@/app/(dashboard)/quote/_component/table";


export default function QuoteTab() {
  const client = useParams();
  const currency = useDataStore.use.currency();
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const reset = useDataStore.use.state();


  const ids = useDataStore.use.ids()
  const addId = useDataStore.use.addId();
  const removeId = useDataStore.use.addId();

  const { mutate: mutateGetQuote, isPending: isGettingQuote } = useQueryAction<
    { id: string },
    RequestResponse<QuoteType[]>
  >(getQuote, () => { }, "quotes");

  useEffect(() => {
    refreshQuotes();
  }, [reset])

  useEffect(() => {
    refreshQuotes()
  }, [client.id])

  function refreshQuotes() {
    if (client.id) {
      mutateGetQuote({ id: client.id as string }, {
        onSuccess(data) {
          if (data.data) {
            setQuotes(data.data)
          }
        },
      })
    }
  }

  const toggleSelection = (quoteId: string) => {
    if (ids.includes(quoteId)) {
      removeId(quoteId);
    } else {
      addId(quoteId);
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
            <TableHead className="font-medium text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isGettingQuote ? (
            <TableRow>
              <TableCell colSpan={6}>
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
                      onCheckedChange={() => toggleSelection(quote.id)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {quote.company.documentModel.quotesPrefix || QUOTE_PREFIX}-{generateAmaId(quote.quoteNumber, false)}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {formatDateToDashModel(quote.createdAt)}
                </TableCell>
                <TableCell className="text-neutral-600 text-center">
                  {quote.amountType === "TTC" ? formatNumber(quote.totalTTC) : formatNumber(quote.totalHT)} {currency}
                </TableCell>
                <TableCell className="text-center">
                  <TableActionButton
                    menus={dropdownMenu}
                    id={quote.id}
                    refreshQuotes={refreshQuotes}
                    deleteTitle="Confirmer la suppression du devis"
                    deleteMessage={
                      <p>
                        En supprimant ce devis, toutes les informations liées
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
                colSpan={6}
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
