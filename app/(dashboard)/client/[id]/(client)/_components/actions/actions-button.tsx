"use client";

import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAccess } from "@/hook/useAccess";
import { useDataStore } from "@/stores/data.store";
import { useParams } from "next/navigation";
import { SetStateAction, use, useEffect, useState } from "react";

import DeliveryNoteModal from "@/components/modal/delivery-note-modal";
import InvoiceModal from "@/components/modal/invoice-modal";
import ModalContainer from "@/components/modal/modal-container";
import QuoteModal from "@/components/modal/quote-modal";
import RevenueModal from "@/components/modal/revenu-modal";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";
import { unique as getClient } from "@/action/client.action";
import { Skeleton } from "@/components/ui/skeleton";
import useClientStore from "@/stores/client.store";

export default function ActionsButton() {
  const [open, setOpen] = useState({
    invoice: false,
    quote: false,
    deliveryNote: false,
    revenue: false,
  });

  const param = useParams();
  const reset = useDataStore.use.reset();
  const setClient = useClientStore.use.setClient();
  const client = useClientStore.use.client();

  const { access: createInvoiceAccess } = useAccess("INVOICES", "CREATE");
  const { access: createQuoteAccess } = useAccess("QUOTES", "CREATE");
  const { access: createDeliveryNoteAccess } = useAccess("DELIVERY_NOTES", "CREATE");
  const { access: createTransactionAccess } = useAccess("TRANSACTION", "CREATE");

  const hasAccess =
    createInvoiceAccess || createQuoteAccess || createDeliveryNoteAccess || createTransactionAccess;

  const { mutate: mutateClient, isPending: isGettingClient } = useQueryAction<
    { id: string },
    RequestResponse<ClientType>
  >(getClient, () => { }, "client");

  useEffect(() => {
    if (param.id) {
      mutateClient(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setClient(data.data);
            }
          },
        }
      );
    }

  }, [param])

  if (!hasAccess) return null;
  if (isGettingClient) return <Skeleton className="w-[120px] h-[48px]" />

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
            size="3xl"
            action={
              <Button className="bg-white justify-start hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]">
                Générer un relevé
              </Button>
            }
            title={`Relevé concernant ${client?.firstname} ${client?.lastname} (${client?.companyName})`}
            open={open.revenue}
            setOpen={(value: SetStateAction<boolean>) =>
              setOpen((prev) => ({ ...prev, revenue: value as boolean }))
            }
          >
            <RevenueModal
            />
          </ModalContainer>
        )}
      </PopoverContent>
    </Popover>
  );
}
