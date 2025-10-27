"use client";
import useTabStore from "@/stores/tab.store";
import { Button } from "@/components/ui/button";
import ActionsButton from "./actions/actions-button";
import ProjectModalCreate from "./actions/project-modal-create";
import { useDataStore } from "@/stores/data.store";
import { useEffect } from "react";
import { removeMany as removeManyInvoice } from "@/action/invoice.action";
import { removeManyQuotes } from "@/action/quote.action";
import { removeManyDeliveryNotes } from "@/action/delivery-note.action";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { InvoiceType } from "@/types/invoice.types";
import { QuoteType } from "@/types/quote.types";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import Spinner from "@/components/ui/spinner";

export default function HeaderActionButton() {
  const currentClientTab = useTabStore.use.tabs()["client-tab"];
  const currentActivityTab = useTabStore.use.tabs()["activity-tab"];
  const reset = useDataStore.use.reset();
  const ids = useDataStore.use.ids()
  const clearIds = useDataStore.use.clearIds();


  const { mutate: mutateDeleteInvoice, isPending: isDelettingInvoice } = useQueryAction<
    { ids: string[] },
    RequestResponse<InvoiceType[]>
  >(removeManyInvoice, () => { }, "invoices");

  const { mutate: mutateDeleteQuote, isPending: isDelettingQuote } = useQueryAction<
    { ids: string[] },
    RequestResponse<QuoteType[]>
  >(removeManyQuotes, () => { }, "quotes");

  const { mutate: mutateDeleteDeliveryNote, isPending: isDelettingDeliveryNote } = useQueryAction<
    { ids: string[] },
    RequestResponse<DeliveryNoteType[]>
  >(removeManyDeliveryNotes, () => { }, "delivery-note");

  useEffect(() => {
    clearIds()
  }, [currentActivityTab])

  function removeRecord() {
    if (ids.length === 0) return
    switch (currentActivityTab) {
      case 0:
        mutateDeleteInvoice({ ids }, {
          onSuccess() {
            clearIds()
            reset()

          },
        })
        break;
      case 1:
        mutateDeleteQuote({ ids }, {
          onSuccess() {
            clearIds()
            reset()
          },
        })
        break;
      case 2:
        mutateDeleteDeliveryNote({ ids }, {
          onSuccess() {
            clearIds()
            reset()
          },
        })
        break;
      case 3:
        alert("Avoir");
        break;

    }
  }

  const renderContent = () => {
    switch (currentClientTab) {
      case 0:
        return (
          <div className="flex gap-x-2">
            <Button onClick={removeRecord} variant="delete" className="w-fit font-medium">
              Suppression {ids.length > 0 && `(${ids.length})`} {isDelettingDeliveryNote || isDelettingInvoice || isDelettingQuote && <Spinner size={15} />}
            </Button>
            <ActionsButton />
          </div>
        );
      case 1:
        return <></>;
      case 2:
        return (
          <div className="flex gap-x-2">
            <ProjectModalCreate />
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="h-12">{renderContent()}</div>;
}
