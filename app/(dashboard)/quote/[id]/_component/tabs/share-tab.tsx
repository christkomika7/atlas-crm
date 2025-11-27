"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import MultipleSelector from "@/components/ui/multi-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { formatDateToDashModel } from "@/lib/date";
import { renderComponentToPDF } from "@/lib/pdf";
import { formatNumber, generateAmaId } from "@/lib/utils";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ModelDocumentType } from "@/types/document.types";
import { unique as uniqueDocument } from "@/action/document.action";
import { QuoteType } from "@/types/quote.types";
import { getUniqueQuote, shareQuote } from "@/action/quote.action";
import { QUOTE_PREFIX } from "@/config/constant";
import RecordDocument from "@/components/pdf/record";
import { recordEmailSchema, RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function ShareTab() {
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();
  const [quote, setQuote] = useState<QuoteType>();

  const param = useParams();

  const readAccess = useAccess("QUOTES", "READ");
  const modifyAccess = useAccess("QUOTES", "MODIFY");

  const form = useForm<RecordEmailSchemaType>({
    resolver: zodResolver(recordEmailSchema),
    defaultValues: {},
  });

  const [document, setDocument] = useState<ModelDocumentType | undefined>(
    undefined,
  );


  const { mutate: mutateGetDocument } =
    useQueryAction<
      { id: string },
      RequestResponse<ModelDocumentType>
    >(uniqueDocument, () => { }, ["model-document"]);

  const { mutate: mutateGetQuote, isPending: isGettingQuote } =
    useQueryAction<{ id: string }, RequestResponse<QuoteType>>(
      getUniqueQuote,
      () => { },
      "quote",
    );


  const { mutate: mutateShareQuote, isPending: isSharingQuote } =
    useQueryAction<RecordEmailSchemaType, RequestResponse<null>>(
      shareQuote,
      () => { },
      "share-quote",
    );

  useEffect(() => {
    if (companyId && readAccess) {
      form.setValue("companyId", companyId);
      mutateGetDocument(
        { id: companyId },
        {
          onSuccess(data) {
            if (data.data) {
              setDocument(data.data);
            }
          },
        },
      );
    }
  }, [companyId, readAccess]);

  useEffect(() => {
    if (param.id && readAccess) {
      mutateGetQuote(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              const quote = data.data;

              const emails = form.getValues().emails ?? [];
              setQuote(quote);
              form.setValue("emails", [...emails, quote.client.email])
            };
          },
        }

      );
      form.setValue("recordId", param.id as string)
    }
  }, [param.id, readAccess]);

  useEffect(() => {
    if (document && quote) {
      async function convertPdfToFile() {
        const pdfData = await renderComponentToPDF(
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
            isLoading={false}
            moreInfos={false}
          />
          , {
            padding: 0,
            margin: 0,
            quality: 0.98,
            scale: 4
          })

        const blob = new Blob([pdfData], { type: "application/pdf" });
        form.setValue("blob", blob);
      }

      convertPdfToFile()
    }
  }, [document, quote])


  function submit(formData: RecordEmailSchemaType) {
    const { success, data } = recordEmailSchema.safeParse(formData);
    if (success) {
      mutateShareQuote(data);
    }
  }

  return (
    <AccessContainer hasAccess={readAccess} resource="QUOTES"  >
      <ScrollArea className="pr-4 h-full">
        {isGettingQuote || !quote ? <Spinner /> :
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submit)}

            >
              <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
                <div className="space-y-4">

                  <div className="space-y-4.5 m-2 max-w-xl">
                    <FormField
                      control={form.control}
                      name="emails"
                      render={({ field }) => (
                        <FormItem className="-space-y-2">
                          <FormControl>
                            <MultipleSelector
                              value={
                                field?.value?.map((v) => ({ label: v, value: v })) ??
                                []
                              }
                              disabled={!modifyAccess}
                              placeholder="Destinataires"
                              onChange={(options) =>
                                field.onChange(options.map((opt) => opt.value))
                              }
                              creatable
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem className="-space-y-2">
                          <FormControl>
                            <TextInput
                              disabled={!modifyAccess}
                              required={false}
                              design="float"
                              label="Objet"
                              value={field.value}
                              handleChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="-space-y-2">
                          <FormControl>
                            <TextInput
                              disabled={!modifyAccess}
                              required={false}
                              design="text-area"
                              label="Message (optionnel)"
                              value={field.value}
                              handleChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field }) => (
                        <FormItem className="-space-y-2">
                          <FormControl>
                            <TextInput
                              type="file"
                              design="float"
                              disabled={!modifyAccess}
                              required={false}
                              label="Pièces jointes supplémentaires"
                              value={field.value}
                              multiple={true}
                              handleChange={field.onChange}
                              showFileData={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                </div>
                <div className="space-y-2">
                  <div className="space-y-2 py-4 border-neutral-200 border-b">
                    <h2 className="font-semibold">Facture</h2>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Date</span>
                      <span>{formatDateToDashModel(quote.createdAt)}</span>
                    </p>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Client</span>
                      <span>{quote.client.firstname} {quote.client.lastname}</span>
                    </p>
                  </div>
                  <div className="space-y-2 py-4 border-neutral-200 border-b">
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span className="font-semibold">Total TTC</span>
                      <span>{formatNumber(quote.totalTTC)} {currency}</span>
                    </p>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Montant facturé</span>
                      <span>{formatNumber(quote.totalTTC)} {currency}</span>
                    </p>
                  </div>
                  {modifyAccess &&
                    <Button variant="primary" disabled={isSharingQuote}>{isSharingQuote ? <Spinner /> : "Partger"}</Button>
                  }
                </div>
              </div>
            </form>
          </Form>
        }
      </ScrollArea>
    </AccessContainer>
  );
}
