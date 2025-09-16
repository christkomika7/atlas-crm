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
import { all } from "@/action/invoice.action";
import { dropdownMenu } from "./table";
import { checkDeadline, cutText, formatNumber } from "@/lib/utils";
import { InvoiceType } from "@/types/invoice.types";

type InvoiceTableProps = {
  filter: "unpaid" | "paid";
  selectedInvoiceIds: string[];
  setSelectedInvoiceIds: Dispatch<SetStateAction<string[]>>;
};

export interface InvoiceTableRef {
  refreshInvoice: () => void;
}

const InvoiceTable = forwardRef<InvoiceTableRef, InvoiceTableProps>(
  ({ selectedInvoiceIds, setSelectedInvoiceIds, filter }, ref) => {
    const id = useDataStore.use.currentCompany();
    const currency = useDataStore.use.currency();
    const { mutate, isPending, data } = useQueryAction<
      { companyId: string; filter: "unpaid" | "paid" },
      RequestResponse<InvoiceType[]>
    >(all, () => {}, "invoices");

    const toggleSelection = (invoiceId: string, checked: boolean) => {
      setSelectedInvoiceIds((prev) =>
        checked ? [...prev, invoiceId] : prev.filter((id) => id !== invoiceId)
      );
    };

    const refreshInvoice = () => {
      if (id) {
        mutate({ companyId: id, filter });
      }
    };

    useImperativeHandle(ref, () => ({
      refreshInvoice,
    }));

    useEffect(() => {
      refreshInvoice();
    }, [id]);

    const isSelected = (id: string) => selectedInvoiceIds.includes(id);

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
              data.data.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className={`h-16 transition-colors ${
                    isSelected(invoice.id) ? "bg-neutral-100" : ""
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
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {cutText(
                      `${invoice.client.firstname} ${invoice.client.lastname}`,
                      20
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {new Date(invoice.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    {formatNumber(invoice.totalTTC)} {currency}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-center">
                    <span
                      className={
                        checkDeadline(invoice.project.deadline).isOverdue
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {checkDeadline(invoice.project.deadline).days}
                      {""} jour
                      {checkDeadline(invoice.project.deadline).days > 1
                        ? "s"
                        : ""}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <TableActionButton
                      menus={dropdownMenu}
                      id={invoice.id}
                      refreshInvoices={refreshInvoice}
                      deleteTitle="Confirmer la suppression du rendez-vous"
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
      </div>
    );
  }
);

InvoiceTable.displayName = "InvoiceTable";

export default InvoiceTable;
