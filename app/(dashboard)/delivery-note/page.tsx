"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import Link from "next/link";
import { DeliveryNoteTableRef } from "./_component/delivery-note-table";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { removeManyDeliveryNotes } from "@/action/delivery-note.action";
import ProgressTab from "./_component/tabs/progress-tab";
import CompleteTab from "./_component/tabs/complete-tab";

export default function DeliveryNotePage() {
  const [selectedDeliveryNoteIds, setSelectedDeliveryNoteIds] = useState<string[]>([]);

  const deliveryNoteTableRef = useRef<DeliveryNoteTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<DeliveryNoteType[]>
  >(removeManyDeliveryNotes, () => { }, "delivery-notes");

  const handleDeliveryNoteAdded = () => {
    deliveryNoteTableRef.current?.refreshDeliveryNote();
  };

  function deleteDeliveryNote() {
    if (selectedDeliveryNoteIds.length > 0) {
      mutate(
        { ids: selectedDeliveryNoteIds },
        {
          onSuccess() {
            setSelectedDeliveryNoteIds([]);
            handleDeliveryNoteAdded();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Bon de livraison">
        <div className="flex gap-x-2">
          <Button
            variant="primary"
            className="bg-red w-fit font-medium"
            onClick={deleteDeliveryNote}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                {selectedDeliveryNoteIds.length > 0 &&
                  `(${selectedDeliveryNoteIds.length})`}{" "}
                Suppression
              </>
            )}
          </Button>
          <Link href="/delivery-note/create">
            <Button variant="primary" className="font-medium">
              Nouveau bon de livraison
            </Button>
          </Link>
        </div>
      </Header>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "En cour",
            content: (
              <ProgressTab
                deliveryNoteTableRef={deliveryNoteTableRef}
                selectedDeliveryNoteIds={selectedDeliveryNoteIds}
                setSelectedDeliveryNoteIds={setSelectedDeliveryNoteIds}
              />
            ),
          },
          {
            id: 2,
            title: "Terminé",
            content: (
              <CompleteTab
                deliveryNoteTableRef={deliveryNoteTableRef}
                selectedDeliveryNoteIds={selectedDeliveryNoteIds}
                setSelectedDeliveryNoteIds={setSelectedDeliveryNoteIds}
              />
            ),
          },
        ]}
        tabId="delivery-note-tab"
      />
    </div>
  );
}
