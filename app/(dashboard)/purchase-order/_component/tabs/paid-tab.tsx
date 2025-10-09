import { Dispatch, RefObject, SetStateAction } from "react";
import PurchaseOrderTable, { PurchaseOrderTableRef } from "../purchase-order-table";

type PaidTabProps = {
  purchaseOrderTableRef: RefObject<PurchaseOrderTableRef | null>;
  selectedPurchaseOrderIds: string[];
  setSelectedPurchaseOrderIds: Dispatch<SetStateAction<string[]>>;
};

export default function PaidTab({
  purchaseOrderTableRef,
  selectedPurchaseOrderIds,
  setSelectedPurchaseOrderIds,
}: PaidTabProps) {
  return (
    <div className="pt-4">
      <PurchaseOrderTable
        filter="paid"
        ref={purchaseOrderTableRef}
        selectedPurchaseOrderIds={selectedPurchaseOrderIds}
        setSelectedPurchaseOrderIds={setSelectedPurchaseOrderIds}
      />
    </div>
  );
}
