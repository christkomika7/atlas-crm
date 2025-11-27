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
import Spinner from "@/components/ui/spinner";
import ModalContainer from "@/components/modal/modal-container";
import PaymentForm from "../../../_component/payment-form";
import RecurrenceForm from "../../../_component/recurrence-form";
import { InvoiceType } from "@/types/invoice.types";
import { unique } from "@/action/invoice.action";
import { useParams, useRouter } from "next/navigation";
import { formatNumber, generateAmaId, getAmountPrice } from "@/lib/utils";
import { downloadComponentAsPDF } from "@/lib/pdf";
import { INVOICE_PREFIX } from "@/config/constant";
import Decimal from "decimal.js";
import RecordDocument from "@/components/pdf/record";
import PaymentHistoryModal from "@/components/modal/payment-history-modal";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function PreviewTab() {
  const param = useParams();
  const router = useRouter();

  const [invoice, setInvoice] = useState<InvoiceType | undefined>(undefined);
  const [filename, setFilename] = useState("");
  const [document, setDocument] = useState<ModelDocumentType | undefined>(
    undefined,
  );
  const [open, setOpen] = useState({
    payment: false,
    recurrence: false,
    paymentHistory: false
  });

  const idCompany = useDataStore.use.currentCompany();

  const { access: readAccess, loading } = useAccess("INVOICES", "READ");
  const { access: modifyAccess } = useAccess("INVOICES", "MODIFY");

  const { mutate: mutateGetInvoice, isPending: isGettingInvoice } =
    useQueryAction<{ id: string }, RequestResponse<InvoiceType>>(
      unique,
      () => { },
      "invoice",
    );

  const { mutate: mutateGetDocument, isPending: isGettingDocument } =
    useQueryAction<
      { id: string },
      RequestResponse<ModelDocumentType>
    >(uniqueDocument, () => { }, ["model-document"]);

  useEffect(() => {
    if (idCompany && readAccess) {
      mutateGetDocument(
        { id: idCompany },
        {
          onSuccess(data) {
            if (data.data) {
              setDocument(data.data);
            }
          },
        },
      );
    }
  }, [idCompany, readAccess]);

  useEffect(() => {
    if (param.id && readAccess) {
      mutateGetInvoice(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setInvoice(data.data);
              setFilename(`Facture ${data.data.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(data.data.invoiceNumber, false)}.pdf`)
            }
          },
        },
      );
    }
  }, [param.id, readAccess]);


  function refresh() {
    if (param.id) {
      mutateGetInvoice(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setInvoice(data.data);
            }
          },
        },
      );
    }
  }

  function close() {
    router.push("/invoice");
  }

  if ((isGettingDocument && isGettingInvoice) || loading) return <Spinner />;

  return (
    <AccessContainer hasAccess={readAccess} resource="INVOICES">
      <ScrollArea className="pr-4 h-full">
        <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
          <div className="space-y-4">
            {!document && !invoice ? (
              <Spinner />
            ) : (
              <>
                <div className="flex justify-end">
                  <Button variant="primary" className="max-w-xs"
                    onClick={() => downloadComponentAsPDF("invoice-bc", filename, {
                      padding: 0,
                      margin: 0,
                      quality: 0.98,
                      scale: 4
                    })}
                  >
                    Télécharger
                  </Button>
                </div>
                <div className="border rounded-xl border-neutral-100">
                  <RecordDocument
                    title="Facture"
                    type="Facture"
                    id="invoice-bc"
                    firstColor={document?.primaryColor || "#fbbf24"}
                    secondColor={document?.secondaryColor || "#fef3c7"}
                    logo={document?.logo}
                    logoSize={document?.size || "Medium"}
                    logoPosition={document?.position || "Center"}
                    orderValue={document?.invoicesPrefix || INVOICE_PREFIX}
                    orderNote={document?.invoicesInfo || ""}
                    record={invoice}
                    recordNumber={`${generateAmaId(invoice?.invoiceNumber ?? 1, false)}`}
                    isLoading={isGettingInvoice}
                    payee={invoice?.payee}
                  />
                </div>
              </>
            )}
          </div>
          <div className="space-y-1">
            {!document || !invoice ? (
              <Spinner />
            ) : (
              <>
                {modifyAccess &&
                  <ModalContainer
                    size="sm"
                    action={<Button variant="primary">Récurrence</Button>}
                    title="Définir une récurrence"
                    open={open.recurrence}
                    setOpen={(value) =>
                      setOpen({ ...open, recurrence: value as boolean })
                    }
                    onClose={() => setOpen({ ...open, recurrence: false })}
                  >
                    <RecurrenceForm closeModal={() => setOpen({ ...open, recurrence: false })} invoiceId={invoice.id as string} />
                    <ModalContainer
                      size="sm"
                      action={<Button variant="primary">Récurrence</Button>}
                      title="Définir une récurrence"
                      open={open.recurrence}
                      setOpen={(value) =>
                        setOpen({ ...open, recurrence: value as boolean })
                      }
                      onClose={() => setOpen({ ...open, recurrence: false })}
                    >
                      <RecurrenceForm closeModal={() => setOpen({ ...open, recurrence: false })} invoiceId={invoice.id as string} />
                    </ModalContainer>     </ModalContainer>
                }
                <div className="flex justify-between items-center mt-2">
                  <h2 className="font-semibold">Facture</h2>
                  <p className="text-sm">
                    N° {document?.invoicesPrefix || INVOICE_PREFIX}-{(generateAmaId(invoice?.invoiceNumber ?? 1, false))}
                  </p>
                </div>
                {new Decimal(invoice.payee || 0).eq(0) && !invoice.isPaid &&
                  <Badge variant="BLOCKED" className="rounded-sm h-6">En attente</Badge>
                }
                {new Decimal(invoice.payee || 0).gt(0) && !invoice.isPaid &&
                  <Badge variant="IN_PROGRESS" className="rounded-sm h-6">En cours</Badge>
                }
                {new Decimal(invoice.payee || 0).gt(0) && invoice.isPaid &&
                  <Badge variant="DONE" className="rounded-sm h-6">Payé</Badge>
                }
                <div className="space-y-2 py-4">
                  <p className="flex justify-between items-center gap-x-2 text-sm">
                    <span className="font-semibold">Montant à payer</span>
                    <span>
                      {invoice ? formatNumber(getAmountPrice(invoice.amountType, invoice?.totalTTC || 0, invoice?.totalHT || 0)) : 0}
                      {" "}{invoice?.company?.currency || "XAF"}
                    </span>
                  </p>
                  <p className="flex justify-between items-center gap-x-2 text-sm">
                    <span>Reste à payer</span>
                    <span>
                      {formatNumber(
                        invoice ? new Decimal(getAmountPrice(invoice.amountType, invoice?.totalTTC || 0, invoice?.totalHT || 0)).minus(invoice?.payee || 0) : 0
                      )}{" "}
                      {invoice?.company?.currency || "XAF"}
                    </span>
                  </p>
                  <p className="flex justify-between items-center gap-x-2 text-sm">
                    <span>Payé</span>
                    <span>
                      {formatNumber(invoice?.payee ?? 0)} {invoice?.company?.currency || "XAF"}
                    </span>
                  </p>
                </div>
                {invoice?.fromRecordId && invoice.fromRecordName && invoice.fromRecordReference &&
                  <p className="flex justify-between items-center gap-x-2 pb-4 text-sm">
                    <span className="font-semibold">Convertir depuis le {invoice.fromRecordName.toLocaleLowerCase()}</span>
                    <span className="font-medium text-blue underline">
                      {invoice.fromRecordReference}
                    </span>
                  </p>
                }
                {modifyAccess &&
                  <>
                    <ModalContainer
                      action={<Button variant="primary" >Historique des paiements</Button>}
                      title="Historique des paiements"
                      open={open.paymentHistory}
                      setOpen={(value) =>
                        setOpen({ ...open, paymentHistory: value as boolean })
                      }
                      onClose={() => setOpen({ ...open, paymentHistory: false })}
                    >
                      <PaymentHistoryModal
                        refresh={refresh}
                        title={` Facture N° ${document?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoice?.invoiceNumber ?? 1, false)} - ${invoice?.client?.companyName || "-"}`}
                        amount={`${formatNumber(
                          invoice ? new Decimal(getAmountPrice(invoice.amountType, invoice?.totalTTC || 0, invoice?.totalHT || 0)).minus(invoice.payee || 0) : 0
                        )} ${invoice?.company?.currency || "XAF"}`}
                        recordId={invoice?.id as string} recordType="invoice" closeModal={() => setOpen({ ...open, paymentHistory: false })} />
                    </ModalContainer>
                    <ModalContainer
                      action={<Button variant="primary" disabled={invoice.isPaid}>Ajouter un paiement</Button>}
                      title="Enregistrer un paiement"
                      open={open.payment}
                      setOpen={(value) =>
                        setOpen({ ...open, payment: value as boolean })
                      }
                      onClose={() => setOpen({ ...open, payment: false })}
                    >
                      <PaymentForm invoiceId={invoice?.id as string} refresh={refresh} closeModal={() => setOpen({ ...open, payment: false })} />
                    </ModalContainer>
                  </>
                }
                <Button
                  onClick={close}
                  variant="primary"
                  className="bg-gray text-black"
                >
                  Fermer
                </Button>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
    </AccessContainer>
  );
}
