"use client";

import { unique as uniqueDocument } from "@/action/document.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useQueryAction from "@/hook/useQueryAction";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { ModelDocumentType } from "@/types/document.types";
import { useEffect, useState } from "react";
import Contract from "../contract";
import Spinner from "@/components/ui/spinner";
import ModalContainer from "@/components/modal/modal-container";
import PaymentForm from "../../../_component/payment-form";
import RecurrenceForm from "../../../_component/recurrence-form";
import { InvoiceType } from "@/types/invoice.types";
import { unique } from "@/action/invoice.action";
import { useParams } from "next/navigation";

export default function PreviewTab() {
  const param = useParams();
  const idCompany = useDataStore.use.currentCompany();
  const [open, setOpen] = useState({
    payment: false,
    recurrence: false,
  });

  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<InvoiceType>
  >(unique, () => {}, "invoice");

  const {
    mutate: mutateDocument,
    isPending: isDocumentPending,
    data: documentData,
  } = useQueryAction<{ id: string }, RequestResponse<ModelDocumentType<File>>>(
    uniqueDocument,
    () => {},
    ["model-document"]
  );

  useEffect(() => {
    if (idCompany) {
      mutateDocument({ id: idCompany });
    }
  }, [idCompany]);

  useEffect(() => {
    if (param.id) {
      mutate({ id: param.id as string });
    }
  }, [param.id]);

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
        <div className="space-y-4">
          {isDocumentPending && !documentData ? (
            <Spinner />
          ) : (
            <>
              <div className="flex justify-end">
                <Button variant="primary" className="max-w-xs">
                  Télécharger
                </Button>
              </div>
              <div className="bg-neutral-50">
                <Contract
                  firstColor={documentData?.data?.primaryColor || "#fbbf24"}
                  secondColor={documentData?.data?.secondaryColor || "#fef3c7"}
                  logo={documentData?.data?.logo}
                  logoSize={documentData?.data?.size ?? "Medium"}
                  logoPosition={documentData?.data?.position ?? "Center"}
                  invoice={data?.data}
                  isLoading={isPending}
                />
              </div>
            </>
          )}
        </div>
        <div className="space-y-2">
          <ModalContainer
            action={<Button variant="primary">Récurrence</Button>}
            title="Définir une récurrence"
            open={open.recurrence}
            setOpen={(value) =>
              setOpen({ ...open, recurrence: value as boolean })
            }
            onClose={() => setOpen({ ...open, recurrence: false })}
          >
            <RecurrenceForm />
          </ModalContainer>
          <div className="flex justify-between items-center mt-4">
            <h2 className="font-semibold">Facture</h2>
            <p className="text-sm">N° AC-F005</p>
          </div>
          <Badge variant="secondary">Non Envoyé</Badge>
          <div className="space-y-2 py-4">
            <p className="flex justify-between items-center gap-x-2 text-sm">
              <span className="font-semibold">Total TTC</span>
              <span>0 FCFA</span>
            </p>
            <p className="flex justify-between items-center gap-x-2 text-sm">
              <span>Payé</span>
              <span>0 FCFA</span>
            </p>
            <p className="flex justify-between items-center gap-x-2 text-sm">
              <span>Payer</span>
              <span>0 FCFA</span>
            </p>
          </div>
          <p className="flex justify-between items-center gap-x-2 pb-4 text-sm">
            <span className="font-semibold">Convertir depuis le devis</span>
            <span className="font-medium text-blue underline">AC-D-023</span>
          </p>
          <ModalContainer
            action={<Button variant="primary">Ajouter un paiement</Button>}
            title="Enregistrer un paiement"
            open={open.payment}
            setOpen={(value) => setOpen({ ...open, payment: value as boolean })}
            onClose={() => setOpen({ ...open, payment: false })}
          >
            <PaymentForm />
          </ModalContainer>
          <Button variant="primary">Sauvegarder</Button>
          <Button variant="primary">Générer un contrat</Button>
          <Button variant="primary" className="bg-gray text-black">
            Fermer
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
