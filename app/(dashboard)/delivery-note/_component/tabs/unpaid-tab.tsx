import { Dispatch, RefObject, SetStateAction } from "react";
import DeliveryNoteTable, { DeliveryNoteTableRef } from "../delivery-note-table";

type UnpaidTabProps = {
  deliveryNoteTableRef: RefObject<DeliveryNoteTableRef | null>;
  selectedDeliveryNoteIds: string[];
  setSelectedDeliveryNoteIds: Dispatch<SetStateAction<string[]>>;
};

export default function UnpaidTab({
  deliveryNoteTableRef,
  selectedDeliveryNoteIds,
  setSelectedDeliveryNoteIds,
}: UnpaidTabProps) {
  return (
    <div className="pt-4">
      <DeliveryNoteTable
        filter="unpaid"
        ref={deliveryNoteTableRef}
        selectedDeleveryNoteIds={selectedDeliveryNoteIds}
        setSelectedDeliveryNoteIds={setSelectedDeliveryNoteIds}
      />
    </div>
  );
}
