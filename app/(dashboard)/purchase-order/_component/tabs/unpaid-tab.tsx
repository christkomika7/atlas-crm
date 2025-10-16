import { Dispatch, RefObject, SetStateAction } from "react";
import PurchaseOrderTable, { PurchaseOrderTableRef } from "../purchase-order-table";

type UnpaidTabProps = {
  purchaseOrderTableRef: RefObject<PurchaseOrderTableRef | null>;
  selectedPurchaseOrderIds: string[];
  setSelectedPurchaseOrderIds: Dispatch<SetStateAction<string[]>>;
};

export default function UnpaidTab({
  purchaseOrderTableRef,
  selectedPurchaseOrderIds,
  setSelectedPurchaseOrderIds,
}: UnpaidTabProps) {
  return (
    <div className="pt-4">
      <PurchaseOrderTable
        filter="unpaid"
        ref={purchaseOrderTableRef}
        selectedPurchaseOrderIds={selectedPurchaseOrderIds}
        setSelectedPurchaseOrderIds={setSelectedPurchaseOrderIds}
      />
    </div>
  );
}
