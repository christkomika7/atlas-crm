"use client";

import { unique as uniqueDocument } from "@/action/document.action";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useQueryAction from "@/hook/useQueryAction";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { ModelDocumentType } from "@/types/document.types";
import { useEffect, useState } from "react";
import Spinner from "@/components/ui/spinner";
import { useParams, useRouter } from "next/navigation";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { downloadComponentAsPDF } from "@/lib/pdf";
import { Decimal } from "decimal.js";
import RecordDocument from "@/components/pdf/record";
import { record } from "zod";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { getUniqueDeliveryNote } from "@/action/delivery-note.action";
import { DELIVERY_NOTE_PREFIX } from "@/config/constant";

export default function PreviewTab() {
  const param = useParams();
  const router = useRouter();

  const [filename, setFilename] = useState("");
  const [deliveryNote, setDeliverNote] = useState<DeliveryNoteType | undefined>(undefined);
  const [document, setDocument] = useState<ModelDocumentType<File> | undefined>(
    undefined,
  );
  const idCompany = useDataStore.use.currentCompany();

  const { mutate: mutateGetDeliveryNote, isPending: isGettingDeliveryNote } =
    useQueryAction<{ id: string }, RequestResponse<DeliveryNoteType>>(
      getUniqueDeliveryNote,
      () => { },
      "delivery-note",
    );

  const { mutate: mutateGetDocument, isPending: isGettingDocument } =
    useQueryAction<
      { id: string },
      RequestResponse<ModelDocumentType<File>>
    >(uniqueDocument, () => { }, ["model-document"]);

  useEffect(() => {
    if (idCompany) {
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
  }, [idCompany]);

  useEffect(() => {
    if (param.id) {
      mutateGetDeliveryNote(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setDeliverNote(data.data);
              setFilename(`Bon de livraison ${data.data.company.documentModel?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(data.data.deliveryNoteNumber, false)}.pdf`)

            }
          },
        },
      );
    }
  }, [param.id]);


  function refresh() {
    if (param.id) {
      mutateGetDeliveryNote(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setDeliverNote(data.data);
            }
          },
        },
      );
    }
  }

  function close() {
    router.push("/delivery-note");
  }

  if (isGettingDocument && isGettingDeliveryNote) return <Spinner />;

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
        <div className="space-y-4">
          {!document && !deliveryNote ? (
            <Spinner />
          ) : (
            <>
              <div className="flex justify-end">
                <Button variant="primary" className="max-w-xs"
                  onClick={() => downloadComponentAsPDF("delivery-note-bc", filename, {
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
                  title="Bon de livraison"
                  type="BL"
                  id="delivery-note-bc"
                  firstColor={document?.primaryColor || "#fbbf24"}
                  secondColor={document?.secondaryColor || "#fef3c7"}
                  logo={document?.logo}
                  logoSize={document?.size || "Medium"}
                  logoPosition={document?.position || "Center"}
                  orderValue={document?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}
                  orderNote={document?.deliveryNotesInfo || ""}
                  record={deliveryNote}
                  recordNumber={`${generateAmaId(deliveryNote?.deliveryNoteNumber ?? 1, false)}`}
                  isLoading={isGettingDeliveryNote}
                  moreInfos={false}
                />
              </div>
            </>
          )}
        </div>
        <div className="space-y-1">
          {!document || !record ? (
            <Spinner />
          ) : (
            <>
              <div className="flex justify-between items-center mt-2">
                <h2 className="font-semibold">Facture</h2>
                <p className="text-sm">
                  N° {document?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-{(generateAmaId(deliveryNote?.deliveryNoteNumber ?? 1, false))}
                </p>
              </div>
              <div className="space-y-2 py-4">
                <p className="flex justify-between items-center gap-x-2 text-sm">
                  <span className="font-semibold">Total TTC</span>
                  <span>
                    {deliveryNote?.totalTTC ? formatNumber(deliveryNote.totalTTC) : 0}{" "}
                    {deliveryNote?.company.currency}
                  </span>
                </p>
                <p className="flex justify-between items-center gap-x-2 text-sm">
                  <span>Arriéré</span>
                  <span>
                    {formatNumber(
                      deliveryNote ? new Decimal(deliveryNote.totalTTC) : 0
                    )}{" "}
                    {deliveryNote?.company.currency}
                  </span>
                </p>
              </div>
              {deliveryNote?.fromRecordId && deliveryNote.fromRecordName && deliveryNote.fromRecordReference &&
                <p className="flex justify-between items-center gap-x-2 pb-4 text-sm">
                  <span className="font-semibold">Convertir depuis le {deliveryNote.fromRecordName.toLocaleLowerCase()}</span>
                  <span className="font-medium text-blue underline">
                    {deliveryNote.fromRecordReference}
                  </span>
                </p>
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
  );
}
