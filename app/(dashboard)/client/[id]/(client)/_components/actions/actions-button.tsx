import { ChevronDownIcon } from "@/components/icons";
import DeliveryNoteModal from "@/components/modal/delivery-note-modal";
import InvoiceModal from "@/components/modal/invoice-modal";
import ModalContainer from "@/components/modal/modal-container";
import QuoteModal from "@/components/modal/quote-modal";
import ReceiptModal from "@/components/modal/receipt-modal";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDataStore } from "@/stores/data.store";
import { useParams } from "next/navigation";

import React, { SetStateAction, useState } from "react";

export default function ActionsButton() {
  const [open, setOpen] = useState({
    invoice: false,
    quote: false,
    deliveryNote: false,
    receipt: false

  })
  const param = useParams()
  const reset = useDataStore.use.reset();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          className="flex justify-center items-center w-[120px] font-medium"
        >
          Nouveau
          <ChevronDownIcon className="top-0.5 relative !size-3 stroke-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-1 w-[180px]">
        <ModalContainer
          size="2xl"
          action={
            <Button
              variant="primary"
              className="bg-white hover:bg-blue justify-start shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
            >
              Créer un devis
            </Button>

          }
          title="Devis"
          open={open.quote}
          setOpen={function (value: SetStateAction<boolean>): void {
            setOpen((prev) => ({ ...prev, quote: value as boolean }));
          }}
        >
          <QuoteModal
            idClient={param.id as string}
            refreshData={() => reset()}
            closeModal={() =>
              setOpen((prev) => ({ ...prev, quote: false }))
            }
          />
        </ModalContainer>
        <ModalContainer
          size="2xl"
          action={
            <Button
              variant="primary"
              className="bg-white hover:bg-blue justify-start shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
            >
              Créer une facture
            </Button>

          }
          title="Facture"
          open={open.invoice}
          setOpen={function (value: SetStateAction<boolean>): void {
            setOpen((prev) => ({ ...prev, invoice: value as boolean }));
          }}
        >
          <InvoiceModal
            idClient={param.id as string}
            refreshData={() => reset()}
            closeModal={() =>
              setOpen((prev) => ({ ...prev, invoice: false }))
            }
          />
        </ModalContainer>
        <ModalContainer
          size="2xl"
          action={
            <Button
              variant="primary"
              className="bg-white hover:bg-blue justify-start shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
            >
              Créer un bon de livraison
            </Button>

          }
          title="Bon de livraison"
          open={open.deliveryNote}
          setOpen={function (value: SetStateAction<boolean>): void {
            setOpen((prev) => ({ ...prev, deliveryNote: value as boolean }));
          }}
        >
          <DeliveryNoteModal
            idClient={param.id as string}
            refreshData={() => reset()}
            closeModal={() =>
              setOpen((prev) => ({ ...prev, deliveryNote: false }))
            }
          />
        </ModalContainer>
        <ModalContainer
          size="2xl"
          action={
            <Button
              variant="primary"
              className="bg-white justify-start hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
            >
              Créer un relevé
            </Button>

          }
          title="Relevé"
          open={open.receipt}
          setOpen={function (value: SetStateAction<boolean>): void {
            setOpen((prev) => ({ ...prev, receipt: value as boolean }));
          }}
        >
          <ReceiptModal
            refreshData={() => reset()}
            closeModal={() =>
              setOpen((prev) => ({ ...prev, receipt: false }))
            }
          />
        </ModalContainer>
      </PopoverContent>
    </Popover>
  );
}
