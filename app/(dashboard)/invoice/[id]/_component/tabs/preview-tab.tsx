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
import { formatNumber } from "@/lib/utils";

export default function PreviewTab() {
  const param = useParams();

  const [invoice, setInvoice] = useState<InvoiceType | undefined>(undefined);
  const [document, setDocument] = useState<ModelDocumentType<File> | undefined>(undefined);
  const [open, setOpen] = useState({
    payment: false,
    recurrence: false,
  });

  const idCompany = useDataStore.use.currentCompany();

  const { mutate: mutateGetInvoice, isPending: isGettingInvoice } = useQueryAction<
    { id: string },
    RequestResponse<InvoiceType>
  >(unique, () => { }, "invoice");

  const {
    mutate: mutateGetDocument,
    isPending: isGettingDocument,
  } = useQueryAction<{ id: string }, RequestResponse<ModelDocumentType<File>>>(
    uniqueDocument,
    () => { },
    ["model-document"]
  );

  useEffect(() => {
    if (idCompany) {
      mutateGetDocument({ id: idCompany }, {
        onSuccess(data) {
          if (data.data) {
            setDocument(data.data);
          }
        },
      });
    }
  }, [idCompany]);

  useEffect(() => {
    if (param.id) {
      mutateGetInvoice({ id: param.id as string }, {
        onSuccess(data) {
          if (data.data) {
            setInvoice(data.data);
          }
        },
      });
    }
  }, [param.id]);

  if (isGettingDocument && isGettingInvoice) return <Spinner />

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
        <div className="space-y-4">
          {!document && !invoice ? (
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
                  firstColor={document?.primaryColor || "#fbbf24"}
                  secondColor={document?.secondaryColor || "#fef3c7"}
                  logo={document?.logo}
                  logoSize={document?.size ?? "Medium"}
                  logoPosition={document?.position ?? "Center"}
                  orderValue={document?.invoicesPrefix ?? "FACTURE"}
                  orderNote={document?.invoicesInfo ?? ""}
                  invoice={invoice}
                  isLoading={isGettingInvoice}
                />
              </div>
            </>
          )}
        </div>
        <div className="space-y-2">
          {!document && !invoice ? (
            <Spinner />
          ) : (
            <>
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
                <p className="text-sm">N° {document?.invoicesPrefix}-{invoice?.invoiceNumber}</p>
              </div>
              <Badge variant="secondary">Non Envoyé</Badge>
              <div className="space-y-2 py-4">
                <p className="flex justify-between items-center gap-x-2 text-sm">
                  <span className="font-semibold">Total TTC</span>
                  <span>{formatNumber(invoice!.totalTTC)} {invoice?.company.currency}</span>
                </p>
                <p className="flex justify-between items-center gap-x-2 text-sm">
                  <span>Arriéré</span>
                  <span>{formatNumber(parseFloat(invoice!.totalTTC) - parseFloat(invoice!.payee))} {invoice?.company.currency}</span>
                </p>
                <p className="flex justify-between items-center gap-x-2 text-sm">
                  <span>Payé</span>
                  <span>{formatNumber(invoice!.payee)} {invoice?.company.currency}</span>
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

            </>

          )}
        </div>
      </div>
    </ScrollArea>
  );
}
