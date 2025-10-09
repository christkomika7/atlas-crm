import { Dispatch, RefObject, SetStateAction } from "react";
import DeliveryNoteTable, { DeliveryNoteTableRef } from "../delivery-note-table";

type PaidTabProps = {
  deliveryNoteTableRef: RefObject<DeliveryNoteTableRef | null>;
  selectedDeliveryNoteIds: string[];
  setSelectedDeliveryNoteIds: Dispatch<SetStateAction<string[]>>;
};

export default function PaidTab({
  deliveryNoteTableRef,
  selectedDeliveryNoteIds,
  setSelectedDeliveryNoteIds,
}: PaidTabProps) {
  return (
    <div className="pt-4">
      <DeliveryNoteTable
        filter="paid"
        ref={deliveryNoteTableRef}
        selectedDeleveryNoteIds={selectedDeliveryNoteIds}
        setSelectedDeliveryNoteIds={setSelectedDeliveryNoteIds}
      />
    </div>
  );
}
