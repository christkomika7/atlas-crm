import { Dispatch, RefObject, SetStateAction } from "react";
import InvoiceTable, { InvoiceTableRef } from "../invoice-table";

type PaidTabProps = {
  invoiceTableRef: RefObject<InvoiceTableRef | null>;
  selectedInvoiceIds: string[];
  setSelectedInvoiceIds: Dispatch<SetStateAction<string[]>>;
};

export default function PaidTab({
  invoiceTableRef,
  selectedInvoiceIds,
  setSelectedInvoiceIds,
}: PaidTabProps) {
  return (
    <div className="pt-4">
      <InvoiceTable
        filter="paid"
        ref={invoiceTableRef}
        selectedInvoiceIds={selectedInvoiceIds}
        setSelectedInvoiceIds={setSelectedInvoiceIds}
      />
    </div>
  );
}
