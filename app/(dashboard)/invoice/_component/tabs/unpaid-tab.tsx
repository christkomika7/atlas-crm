import { Dispatch, RefObject, SetStateAction } from "react";
import InvoiceTable, { InvoiceTableRef } from "../invoice-table";

type UnpaidTabProps = {
  invoiceTableRef: RefObject<InvoiceTableRef | null>;
  selectedInvoiceIds: string[];
  setSelectedInvoiceIds: Dispatch<SetStateAction<string[]>>;
};

export default function UnpaidTab({
  invoiceTableRef,
  selectedInvoiceIds,
  setSelectedInvoiceIds,
}: UnpaidTabProps) {
  return (
    <div className="pt-4">
      <InvoiceTable
        filter="unpaid"
        ref={invoiceTableRef}
        selectedInvoiceIds={selectedInvoiceIds}
        setSelectedInvoiceIds={setSelectedInvoiceIds}
      />
    </div>
  );
}
