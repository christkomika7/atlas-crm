"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { RequestResponse } from "@/types/api.types";
import { getInvoice } from "@/action/client.action";
import { useDataStore } from "@/stores/data.store";
import { InvoiceType } from "@/types/invoice.types";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { INVOICE_PREFIX } from "@/config/constant";
import { formatDateToDashModel } from "@/lib/date";
import { useParams } from "next/navigation";
import { dropdownMenu } from "@/app/(dashboard)/invoice/_component/table";


import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import Decimal from "decimal.js";
import TableActionButton from "@/app/(dashboard)/invoice/_component/table-action-button";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function InvoiceTab() {
  const client = useParams();
  const currency = useDataStore.use.currency();
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const reset = useDataStore.use.state()

  const ids = useDataStore.use.ids();
  const addId = useDataStore.use.addId();
  const removeId = useDataStore.use.removeId();

  const { access: readAccess, loading } = useAccess("INVOICES", "READ");

  const { mutate: mutateGetInvoice, isPending: isGettingInvoice } = useQueryAction<
    { id: string },
    RequestResponse<InvoiceType[]>
  >(getInvoice, () => { }, "invoices");

  useEffect(() => {
    if (readAccess) {
      refreshInvoices();
    }
  }, [reset, readAccess])

  useEffect(() => {
    if (readAccess) {
      refreshInvoices();
    }
  }, [client?.id, readAccess]);

  function refreshInvoices() {
    if (client?.id) {
      mutateGetInvoice({ id: client.id as string }, {
        onSuccess(data) {
          if (data.data) {
            setInvoices(data.data);
          }
        },
      });
    }
  }

  const toggleSelection = (invoiceId: string) => {
    if (ids.includes(invoiceId)) {
      removeId(invoiceId);
    } else {
      addId(invoiceId);
    }
  };

  const isSelected = (id: string) => ids.includes(id);

  if (loading) return <Spinner />

  return (
    <AccessContainer hasAccess={readAccess} resource="INVOICES">
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
                <TableCell colSpan={7}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : invoices.length > 0 ? (
              invoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className={`h-16 transition-colors ${isSelected(invoice.id) ? "bg-neutral-100" : ""}`}
                >
                  <TableCell className="text-neutral-600">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={isSelected(invoice.id)}
                        onCheckedChange={() => toggleSelection(invoice.id)}
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
                    {formatNumber(
                      invoice.amountType === "TTC"
                        ? new Decimal(invoice.totalTTC).minus(invoice.payee)
                        : new Decimal(invoice.totalHT).minus(invoice.payee)
                    )} {currency}
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      data={invoice}
                      refreshInvoices={refreshInvoices}
                      deleteTitle="Confirmer la suppression de la facture"
                      deleteMessage={
                        <p>
                          En supprimant cette facture, toutes les informations liées
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
                  Aucune facture trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AccessContainer>
  );
}
