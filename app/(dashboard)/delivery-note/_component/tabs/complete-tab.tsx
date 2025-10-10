import { Dispatch, RefObject, SetStateAction } from "react";
import DeliveryNoteTable, { DeliveryNoteTableRef } from "../delivery-note-table";

type CompleteTabProps = {
  deliveryNoteTableRef: RefObject<DeliveryNoteTableRef | null>;
  selectedDeliveryNoteIds: string[];
  setSelectedDeliveryNoteIds: Dispatch<SetStateAction<string[]>>;
};

export default function CompleteTab({
  deliveryNoteTableRef,
  selectedDeliveryNoteIds,
  setSelectedDeliveryNoteIds,
}: CompleteTabProps) {
  return (
    <div className="pt-4">
      <DeliveryNoteTable
        filter="complete"
        ref={deliveryNoteTableRef}
        selectedDeleveryNoteIds={selectedDeliveryNoteIds}
        setSelectedDeliveryNoteIds={setSelectedDeliveryNoteIds}
      />
    </div>
  );
}
