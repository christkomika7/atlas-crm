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
import { useAccess } from "@/hook/useAccess";

export default function HeaderActionButton() {
  const currentClientTab = useTabStore.use.tabs()["client-tab"];
  const currentActivityTab = useTabStore.use.tabs()["activity-tab"];

  const reset = useDataStore.use.reset();
  const ids = useDataStore.use.ids();
  const clearIds = useDataStore.use.clearIds();

  const { access: modifyInvoiceAccess } = useAccess("INVOICES", "MODIFY");
  const { access: modifyQuoteAccess } = useAccess("QUOTES", "MODIFY");
  const { access: modifyDeliveryNoteAccess } = useAccess("DELIVERY_NOTES", "MODIFY");
  const { access: createProjectAccess } = useAccess("PROJECTS", "CREATE");

  const { mutate: mutateDeleteInvoice, isPending: isDeletingInvoice } = useQueryAction<
    { ids: string[] },
    RequestResponse<InvoiceType[]>
  >(removeManyInvoice, () => { }, "invoices");

  const { mutate: mutateDeleteQuote, isPending: isDeletingQuote } = useQueryAction<
    { ids: string[] },
    RequestResponse<QuoteType[]>
  >(removeManyQuotes, () => { }, "quotes");

  const { mutate: mutateDeleteDeliveryNote, isPending: isDeletingDeliveryNote } = useQueryAction<
    { ids: string[] },
    RequestResponse<DeliveryNoteType[]>
  >(removeManyDeliveryNotes, () => { }, "delivery-note");

  useEffect(() => {
    clearIds();
  }, [currentActivityTab]);

  function removeRecord() {
    if (ids.length === 0) return;

    const actions: Record<number, () => void> = {
      0: () =>
        mutateDeleteInvoice(
          { ids },
          {
            onSuccess() {
              clearIds();
              reset();
            },
          }
        ),
      1: () =>
        mutateDeleteQuote(
          { ids },
          {
            onSuccess() {
              clearIds();
              reset();
            },
          }
        ),
      2: () =>
        mutateDeleteDeliveryNote(
          { ids },
          {
            onSuccess() {
              clearIds();
              reset();
            },
          }
        ),
      3: () => alert("Avoir"),
    };

    actions[currentActivityTab]?.();
  }

  const renderContent = () => {
    switch (currentClientTab) {
      case 0:
        return (
          <div className="flex gap-x-2">
            {((currentActivityTab === 0 && modifyInvoiceAccess) ||
              (currentActivityTab === 1 && modifyQuoteAccess) ||
              (currentActivityTab === 2 && modifyDeliveryNoteAccess)) && (
                <Button
                  onClick={removeRecord}
                  variant="delete"
                  className="w-fit font-medium"
                >
                  Suppression {ids.length > 0 && `(${ids.length})`}{" "}
                  {(isDeletingDeliveryNote || isDeletingInvoice || isDeletingQuote) && (
                    <Spinner size={15} />
                  )}
                </Button>
              )}
            <ActionsButton />
          </div>
        );
      case 1:
        return <></>;
      case 2:
        return (
          <div className="flex gap-x-2">
            {createProjectAccess && <ProjectModalCreate />}
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="h-12">{renderContent()}</div>;
}
