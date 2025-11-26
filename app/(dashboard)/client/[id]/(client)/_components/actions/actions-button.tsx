"use client";

import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAccess } from "@/hook/useAccess";
import { useDataStore } from "@/stores/data.store";
import { useParams } from "next/navigation";
import { SetStateAction, useState } from "react";

import DeliveryNoteModal from "@/components/modal/delivery-note-modal";
import InvoiceModal from "@/components/modal/invoice-modal";
import ModalContainer from "@/components/modal/modal-container";
import QuoteModal from "@/components/modal/quote-modal";
import ReceiptModal from "@/components/modal/receipt-modal";

export default function ActionsButton() {
  const [open, setOpen] = useState({
    invoice: false,
    quote: false,
    deliveryNote: false,
    receipt: false,
  });

  const param = useParams();
  const reset = useDataStore.use.reset();

  const createInvoiceAccess = useAccess("INVOICES", "CREATE");
  const createQuoteAccess = useAccess("QUOTES", "CREATE");
  const createDeliveryNoteAccess = useAccess("DELIVERY_NOTES", "CREATE");
  const createTransactionAccess = useAccess("TRANSACTION", "CREATE");

  const hasAccess =
    createInvoiceAccess || createQuoteAccess || createDeliveryNoteAccess || createTransactionAccess;

  if (!hasAccess) return null;

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
        {createQuoteAccess && (
          <ModalContainer
            size="2xl"
            action={
              <Button className="bg-white hover:bg-blue justify-start shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]">
                Créer un devis
              </Button>
            }
            title="Devis"
            open={open.quote}
            setOpen={(value: SetStateAction<boolean>) =>
              setOpen((prev) => ({ ...prev, quote: value as boolean }))
            }
          >
            <QuoteModal
              idClient={param.id as string}
              refreshData={() => reset()}
              closeModal={() => setOpen((prev) => ({ ...prev, quote: false }))}
            />
          </ModalContainer>
        )}

        {createInvoiceAccess && (
          <ModalContainer
            size="2xl"
            action={
              <Button className="bg-white hover:bg-blue justify-start shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]">
                Créer une facture
              </Button>
            }
            title="Facture"
            open={open.invoice}
            setOpen={(value: SetStateAction<boolean>) =>
              setOpen((prev) => ({ ...prev, invoice: value as boolean }))
            }
          >
            <InvoiceModal
              idClient={param.id as string}
              refreshData={() => reset()}
              closeModal={() => setOpen((prev) => ({ ...prev, invoice: false }))}
            />
          </ModalContainer>
        )}

        {createDeliveryNoteAccess && (
          <ModalContainer
            size="2xl"
            action={
              <Button className="bg-white hover:bg-blue justify-start shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]">
                Créer un bon de livraison
              </Button>
            }
            title="Bon de livraison"
            open={open.deliveryNote}
            setOpen={(value: SetStateAction<boolean>) =>
              setOpen((prev) => ({ ...prev, deliveryNote: value as boolean }))
            }
          >
            <DeliveryNoteModal
              idClient={param.id as string}
              refreshData={() => reset()}
              closeModal={() => setOpen((prev) => ({ ...prev, deliveryNote: false }))}
            />
          </ModalContainer>
        )}

        {createTransactionAccess && (
          <ModalContainer
            size="2xl"
            action={
              <Button className="bg-white justify-start hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]">
                Créer un relevé
              </Button>
            }
            title="Relevé"
            open={open.receipt}
            setOpen={(value: SetStateAction<boolean>) =>
              setOpen((prev) => ({ ...prev, receipt: value as boolean }))
            }
          >
            <ReceiptModal
              refreshData={() => reset()}
              closeModal={() => setOpen((prev) => ({ ...prev, receipt: false }))}
            />
          </ModalContainer>
        )}
      </PopoverContent>
    </Popover>
  );
}
