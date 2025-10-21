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
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { all, getInvoice } from "@/action/client.action";
import { useDataStore } from "@/stores/data.store";
import Spinner from "@/components/ui/spinner";
import { InvoiceType } from "@/types/invoice.types";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { INVOICE_PREFIX } from "@/config/constant";
import { formatDateToDashModel } from "@/lib/date";

type InvoiceTableProps = {
  selectedInvoicIds: string[];
  setSelectedInvoiceIds: Dispatch<SetStateAction<string[]>>;
};

export interface InvoiceTableRef {
  refreshInvoices: () => void;
}

const InvoiceTable = forwardRef<InvoiceTableRef, InvoiceTableProps>(
  (
    {
      selectedInvoicIds, setSelectedInvoiceIds
    },
    ref
  ) => {
    const currency = useDataStore.use.currency();
    const clientId = "";
    const [invoices, setInvoices] = useState<InvoiceType[]>([]);

    const { mutate: mutateGetInvoice, isPending: isGettingInvoice } = useQueryAction<
      { id: string },
      RequestResponse<InvoiceType[]>
    >(getInvoice, () => { }, "invoices");

    const toggleSelection = (invoiceId: string, checked: boolean) => {
      setSelectedInvoiceIds((prev) =>
        checked ? [...prev, invoiceId] : prev.filter((id) => id !== invoiceId)
      );
    };

    const refreshInvoices = () => {
      if (clientId) {
        mutateGetInvoice({ id: clientId });
      }
    };

    // Exposer la méthode refreshClients via la ref
    useImperativeHandle(ref, () => ({
      refreshInvoices,
    }));

    useEffect(() => {
      refreshInvoices();
    }, [clientId]);

    const isSelected = (id: string) => selectedInvoicIds.includes(id);

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
            {isGettingInvoice ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className={`h-16 transition-colors ${isSelected(invoice.id) ? "bg-neutral-100" : ""
                    }`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(invoice.id)}
                        onCheckedChange={(checked) =>
                          toggleSelection(invoice.id, !!checked)
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {invoice.company.documentModel.invoicesPrefix || INVOICE_PREFIX}-{generateAmaId(invoice.invoiceNumber, false)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatDateToDashModel(invoice.createdAt)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {invoice.amountType === "TTC" ? formatNumber(invoice.totalTTC) : formatNumber(invoice.totalHT)} {currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(invoice.payee)} {currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(invoice.amountType === "TTC" ? invoice.totalTTC.minus(invoice.payee) : invoice.totalHT.minus(invoice.payee))} {currency}
                  </TableCell>
                  <TableCell className="text-center">
                    {/* <TableActionButton
                      menus={dropdownMenu}
                      id={client.id}
                      refreshClients={refreshClients}
                      deleteTitle="Confirmer la suppression du client"
                      deleteMessage={
                        <p>
                          En supprimant ce client, toutes les informations liées
                          (<strong>factures, paiements, historiques</strong>)
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
                    /> */}
                    X
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-6 text-gray-500 text-sm text-center"
                >
                  Aucun client trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }
);

InvoiceTable.displayName = "InvoiceTable";

export default InvoiceTable;
