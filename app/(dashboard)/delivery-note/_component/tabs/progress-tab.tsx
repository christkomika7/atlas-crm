import { Dispatch, RefObject, SetStateAction } from "react";
import DeliveryNoteTable, { DeliveryNoteTableRef } from "../delivery-note-table";

type ProgressTabProps = {
  deliveryNoteTableRef: RefObject<DeliveryNoteTableRef | null>;
  selectedDeliveryNoteIds: string[];
  setSelectedDeliveryNoteIds: Dispatch<SetStateAction<string[]>>;
};

export default function ProgressTab({
  deliveryNoteTableRef,
  selectedDeliveryNoteIds,
  setSelectedDeliveryNoteIds,
}: ProgressTabProps) {
  return (
    <div className="pt-4">
      <DeliveryNoteTable
        filter="progress"
        ref={deliveryNoteTableRef}
        selectedDeleveryNoteIds={selectedDeliveryNoteIds}
        setSelectedDeliveryNoteIds={setSelectedDeliveryNoteIds}
      />
    </div>
  );
}
