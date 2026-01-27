"use client";
import { share, unique } from "@/action/invoice.action";
import { Badge } from "@/components/ui/badge";
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
import { InvoiceType } from "@/types/invoice.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ModelDocumentType } from "@/types/document.types";
import { unique as uniqueDocument } from "@/action/document.action";
import Decimal from "decimal.js";
import { INVOICE_PREFIX } from "@/config/constant";
import RecordDocument from "@/components/pdf/record";
import { recordEmailSchema, RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import NoAccess, { NoAccessResource } from "@/components/errors/no-access";

export default function ShareTab() {
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();
  const [invoice, setInvoice] = useState<InvoiceType>();
  const [filename, setFilename] = useState("");

  const param = useParams();

  const { access: readAccess, loading } = useAccess("INVOICES", "READ");
  const { access: modifyAccess } = useAccess("INVOICES", "MODIFY");

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

  const { mutate: mutateGetInvoice, isPending: isGettingInvoice } =
    useQueryAction<{ id: string }, RequestResponse<InvoiceType>>(
      unique,
      () => { },
      "invoice",
    );


  const { mutate: mutateShareInvoice, isPending: isSharingInvoice } =
    useQueryAction<RecordEmailSchemaType, RequestResponse<null>>(
      share,
      () => { },
      "share",
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
      mutateGetInvoice(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              const invoice = data.data;
              const emails = form.getValues().emails ?? [];
              setInvoice(invoice);
              form.setValue("emails", [...emails, invoice.client.email]);
              setFilename(`Facture ${data.data.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(data.data.invoiceNumber, false)}`)

            };
          },
        }

      );
      form.setValue('recordId', param.id as string)
    }
  }, [param.id, readAccess]);

  useEffect(() => {
    if (document && invoice) {
      async function convertPdfToFile() {
        const pdfData = await renderComponentToPDF(
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
            payee={invoice?.payee}
            recordNumber={`${generateAmaId(invoice?.invoiceNumber ?? 1, false)}`}
            isLoading={false}
            note={invoice?.company.documentModel.invoicesInfo}
          />
          , {
            padding: 0,
            margin: 0,
            quality: 0.98,
            scale: 4,
            headerText: `- ${filename} - ${formatDateToDashModel(new Date(invoice?.createdAt || new Date()))}`
          })
        const blob = new Blob([pdfData], { type: "application/pdf" });
        form.setValue("blob", blob);
      }

      convertPdfToFile()
    }
  }, [document, invoice])


  function submit(formData: RecordEmailSchemaType) {
    const { success, data } = recordEmailSchema.safeParse(formData);
    if (success) {
      mutateShareInvoice(data);
    }
  }

  if (loading) return <Spinner />

  return (
    <>
      {!invoice?.projectId ? <NoAccess type={NoAccessResource.NO_PROJECT} /> :
        <AccessContainer hasAccess={readAccess} resource="INVOICES">
          <ScrollArea className="pr-4 h-full">
            {isGettingInvoice || !invoice ? <Spinner /> :
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
                                  disabled={!modifyAccess}
                                  value={
                                    field?.value?.map((v) => ({ label: v, value: v })) ??
                                    []
                                  }
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
                                  required={false}
                                  disabled={!modifyAccess}
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
                          <span>{formatDateToDashModel(invoice.createdAt)}</span>
                        </p>
                        <p className="flex justify-between items-center gap-x-2 text-sm">
                          <span>Client</span>
                          <span>{invoice.client.firstname} {invoice.client.lastname}</span>
                        </p>
                      </div>
                      <div className="space-y-2 py-4 border-neutral-200 border-b">
                        <p className="flex justify-between items-center gap-x-2 text-sm">
                          <span className="font-semibold">Total TTC</span>
                          <span>{formatNumber(invoice.totalTTC)} {currency}</span>
                        </p>
                        <p className="flex justify-between items-center gap-x-2 text-sm">
                          <span>Montant facturé</span>
                          <span>{formatNumber(invoice.totalTTC)} {currency}</span>
                        </p>
                        <p className="flex justify-between items-center gap-x-2 text-sm">
                          <span>Payer</span>
                          <span>{formatNumber(invoice.payee)} {currency}</span>
                        </p>
                      </div>
                      {new Decimal(invoice.payee).eq(0) && !invoice.isPaid &&
                        <Badge variant="BLOCKED" className="rounded-sm h-6">En attente</Badge>
                      }
                      {new Decimal(invoice.payee).gt(0) && !invoice.isPaid &&
                        <Badge variant="IN_PROGRESS" className="rounded-sm h-6">En cours</Badge>
                      }
                      {new Decimal(invoice.payee).gt(0) && invoice.isPaid &&
                        <Badge variant="DONE" className="rounded-sm h-6">Payé</Badge>
                      }
                      {modifyAccess &&
                        <Button variant="primary">{isSharingInvoice ? <Spinner /> : "Partger"}</Button>
                      }
                    </div>
                  </div>
                </form>
              </Form>
            }
          </ScrollArea>
        </AccessContainer>
      }
    </>
  );
}
