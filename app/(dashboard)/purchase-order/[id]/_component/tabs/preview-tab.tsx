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
import { useParams, useRouter } from "next/navigation";
import { formatNumber, generateAmaId, getAmountPrice } from "@/lib/utils";
import { downloadComponentAsPDF } from "@/lib/pdf";
import Decimal from "decimal.js";
import RecordDocument from "@/components/pdf/record";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { unique } from "@/action/purchase-order.action";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { InvoiceType } from "@/types/invoice.types";
import PaymentHistoryModal from "@/components/modal/payment-history-modal";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import { formatDateToDashModel } from "@/lib/date";
import NoAccess, { NoAccessResource } from "@/components/errors/no-access";

export default function PreviewTab() {
  const param = useParams();
  const router = useRouter();

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderType | undefined>(undefined);
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


  const { access: readAccess, loading } = useAccess("PURCHASE_ORDER", "READ");
  const { access: modifyAccess } = useAccess("PURCHASE_ORDER", "MODIFY");

  const { mutate: mutateGetPurchaseOrder, isPending: isGettingPurchaseOrder } =
    useQueryAction<{ id: string }, RequestResponse<PurchaseOrderType>>(
      unique,
      () => { },
      "purchase-order",
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
      mutateGetPurchaseOrder(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setPurchaseOrder(data.data);
              setFilename(`Bon de commande ${data.data.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(data.data.purchaseOrderNumber, false)}.pdf`)

            }
          },
        },
      );
    }
  }, [param.id, readAccess]);


  function refresh() {
    if (param.id) {
      mutateGetPurchaseOrder(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setPurchaseOrder(data.data);
            }
          },
        },
      );
    }
  }

  function close() {
    router.push("/purchase-order");
  }


  return (
    <AccessContainer hasAccess={readAccess} resource="PURCHASE_ORDER" loading={(isGettingDocument && isGettingPurchaseOrder) || loading}>
      {!purchaseOrder?.projectId ? <NoAccess type={NoAccessResource.NO_PROJECT} /> :
        <ScrollArea className="pr-4 h-full">
          <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
            <div className="space-y-4">
              {!document && !purchaseOrder ? (
                <Spinner />
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button variant="primary" className="max-w-xs"
                      onClick={() => downloadComponentAsPDF("purchase-order", filename, {
                        padding: 0,
                        margin: 0,
                        quality: 0.98,
                        scale: 4,
                        headerText: `- ${filename.split(".pdf")[0]} - ${formatDateToDashModel(new Date(purchaseOrder?.createdAt || new Date()))}`
                      })}
                    >
                      Télécharger
                    </Button>
                  </div>
                  <div className="border rounded-xl border-neutral-100">
                    <RecordDocument
                      title="BON DE COMMANDE"
                      type="BC"
                      id="purchase-order"
                      firstColor={document?.primaryColor || "#fbbf24"}
                      secondColor={document?.secondaryColor || "#fef3c7"}
                      logo={document?.logo}
                      logoSize={document?.size || "Medium"}
                      logoPosition={document?.position || "Center"}
                      orderValue={document?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}
                      orderNote={document?.purchaseOrderInfo || ""}
                      record={purchaseOrder as unknown as InvoiceType}
                      recordNumber={`${generateAmaId(purchaseOrder?.purchaseOrderNumber ?? 1, false)}`}
                      supplier={purchaseOrder?.supplier}
                      isLoading={isGettingPurchaseOrder}
                      payee={purchaseOrder?.payee}
                      note={purchaseOrder.company.documentModel.purchaseOrderInfo}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="space-y-1">
              {!document || !purchaseOrder ? (
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
                      <RecurrenceForm closeModal={() => setOpen({ ...open, recurrence: false })} purchaseOrderId={purchaseOrder.id as string} />
                    </ModalContainer>
                  }
                  <div className="flex justify-between items-center mt-2">
                    <h2 className="font-semibold">Bon de commande</h2>
                    <p className="text-sm">
                      N° {document?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-{(generateAmaId(purchaseOrder?.purchaseOrderNumber ?? 1, false))}
                    </p>
                  </div>
                  {new Decimal(purchaseOrder.payee).eq(0) && !purchaseOrder.isPaid &&
                    <Badge variant="BLOCKED" className="rounded-sm h-6">En attente</Badge>
                  }
                  {new Decimal(purchaseOrder.payee).gt(0) && !purchaseOrder.isPaid &&
                    <Badge variant="IN_PROGRESS" className="rounded-sm h-6">En cours</Badge>
                  }
                  {new Decimal(purchaseOrder.payee).gt(0) && purchaseOrder.isPaid &&
                    <Badge variant="DONE" className="rounded-sm h-6">Payé</Badge>
                  }
                  <div className="space-y-2 py-4">
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span className="font-semibold">Montant à payer</span>
                      <span>
                        {purchaseOrder ? formatNumber(getAmountPrice(purchaseOrder.amountType, purchaseOrder?.totalTTC, purchaseOrder?.totalHT)) : 0}
                        {" "}{purchaseOrder?.company.currency}
                      </span>
                    </p>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Reste à payer</span>
                      <span>
                        {formatNumber(
                          purchaseOrder ? new Decimal(getAmountPrice(purchaseOrder.amountType, purchaseOrder?.totalTTC, purchaseOrder?.totalHT)).minus(purchaseOrder.payee) : 0
                        )}{" "}
                        {purchaseOrder?.company.currency}
                      </span>
                    </p>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Payé</span>
                      <span>
                        {formatNumber(purchaseOrder?.payee ?? 0)} {purchaseOrder?.company.currency}
                      </span>
                    </p>
                  </div>
                  {modifyAccess &&
                    <>
                      <ModalContainer
                        action={<Button variant="primary">Historique des paiements</Button>}
                        title="Historique des paiements"
                        open={open.paymentHistory}
                        setOpen={(value) =>
                          setOpen({ ...open, paymentHistory: value as boolean })
                        }
                        onClose={() => setOpen({ ...open, paymentHistory: false })}
                      >
                        <PaymentHistoryModal
                          refresh={refresh}
                          title={` Bon de commande N° ${document?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(purchaseOrder?.purchaseOrderNumber ?? 1, false)} - ${purchaseOrder.supplier.companyName}`}
                          amount={`${formatNumber(
                            purchaseOrder ? new Decimal(getAmountPrice(purchaseOrder.amountType, purchaseOrder?.totalTTC, purchaseOrder?.totalHT)).minus(purchaseOrder.payee) : 0
                          )} ${purchaseOrder.company.currency}`}
                          recordId={purchaseOrder?.id as string} recordType="purchase-order" closeModal={() => setOpen({ ...open, paymentHistory: false })} />
                      </ModalContainer>
                      <ModalContainer
                        action={<Button variant="primary" disabled={purchaseOrder.isPaid}>Ajouter un paiement</Button>}
                        title="Enregistrer un paiement"
                        open={open.payment}
                        setOpen={(value) =>
                          setOpen({ ...open, payment: value as boolean })
                        }
                        onClose={() => setOpen({ ...open, payment: false })}
                      >
                        <PaymentForm purchaseOrderId={purchaseOrder?.id as string} refresh={refresh} closeModal={() => setOpen({ ...open, payment: false })} />
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
      }
    </AccessContainer>
  );
}
