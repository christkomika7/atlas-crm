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
import { generateAmaId } from "@/lib/utils";
import { downloadComponentAsPDF } from "@/lib/pdf";
import { QUOTE_PREFIX } from "@/config/constant";
import { QuoteType } from "@/types/quote.types";
import { getUniqueQuote } from "@/action/quote.action";
import RecordDocument from "@/components/pdf/record";
import { record } from "zod";
import Decimal from "decimal.js";

export default function PreviewTab() {
  const param = useParams();
  const router = useRouter();

  const [filename, setFilename] = useState("");
  const [quote, setQuote] = useState<QuoteType | undefined>(undefined);
  const [document, setDocument] = useState<ModelDocumentType<File> | undefined>(
    undefined,
  );

  const idCompany = useDataStore.use.currentCompany();

  const { mutate: mutateGetQuote, isPending: isGettingQuote } =
    useQueryAction<{ id: string }, RequestResponse<QuoteType>>(
      getUniqueQuote,
      () => { },
      "quote",
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
      mutateGetQuote(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setQuote(data.data);
            }
          },
        },
      );
    }
  }, [param.id]);


  function refresh() {
    if (param.id) {
      mutateGetQuote(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setQuote(data.data);
              setFilename(`Devis ${data.data.company.documentModel?.quotesPrefix || QUOTE_PREFIX}-${generateAmaId(data.data.quoteNumber, false)}.pdf`)

            }
          },
        },
      );
    }
  }

  function close() {
    router.push("/quote");
  }

  if (isGettingDocument && isGettingQuote) return <Spinner />;

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
        <div className="space-y-4">
          {!document && !quote ? (
            <Spinner />
          ) : (
            <>
              <div className="flex justify-end">
                <Button variant="primary" className="max-w-xs"
                  onClick={() => downloadComponentAsPDF("quote-bc", filename, {
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
                  title="Devis"
                  type="Devis"
                  id="quote-bc"
                  firstColor={document?.primaryColor || "#fbbf24"}
                  secondColor={document?.secondaryColor || "#fef3c7"}
                  logo={document?.logo}
                  logoSize={document?.size || "Medium"}
                  logoPosition={document?.position || "Center"}
                  orderValue={document?.quotesPrefix || QUOTE_PREFIX}
                  orderNote={document?.quotesInfo || ""}
                  record={quote}
                  recordNumber={`${generateAmaId(quote?.quoteNumber ?? 1, false)}`}
                  isLoading={isGettingQuote}
                  payee={new Decimal(0)}
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
                <h2 className="font-semibold">Devis</h2>
                <p className="text-sm">
                  N° {document?.quotesPrefix || QUOTE_PREFIX}-{(generateAmaId(quote?.quoteNumber ?? 1, false))}
                </p>
              </div>
              <div className="space-y-2 py-4">
              </div>
              {quote?.fromRecordId && quote.fromRecordName && quote.fromRecordReference &&
                <p className="flex justify-between items-center gap-x-2 pb-4 text-sm">
                  <span className="font-semibold">Convertir depuis le {quote.fromRecordName.toLocaleLowerCase()}</span>
                  <span className="font-medium text-blue underline">
                    {quote.fromRecordReference}
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
