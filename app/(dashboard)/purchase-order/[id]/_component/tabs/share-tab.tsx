"use client";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ModelDocumentType } from "@/types/document.types";
import { unique as uniqueDocument } from "@/action/document.action";
import Decimal from "decimal.js";
import RecordDocument from "@/components/pdf/record";
import { recordEmailSchema, RecordEmailSchemaType } from "@/lib/zod/record-email.schema";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { share, unique } from "@/action/purchase-order.action";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { InvoiceType } from "@/types/invoice.types";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function ShareTab() {
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderType>();

  const param = useParams();

  const { access: readAccess, loading } = useAccess("PURCHASE_ORDER", "READ");
  const { access: modifyAccess } = useAccess("PURCHASE_ORDER", "MODIFY");

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

  const { mutate: mutateGetPurchaseOrder, isPending: isGettingPurchaseOrder } =
    useQueryAction<{ id: string }, RequestResponse<PurchaseOrderType>>(
      unique,
      () => { },
      "purchase-order",
    );


  const { mutate: mutateSharePurchaseOrder, isPending: isSharingPurchaseOrder } =
    useQueryAction<RecordEmailSchemaType, RequestResponse<null>>(
      share,
      () => { },
      "share-purchase-order",
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
      mutateGetPurchaseOrder(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              const purchaseOrder = data.data;
              const emails = form.getValues().emails ?? [];
              setPurchaseOrder(purchaseOrder);
              form.setValue("emails", [...emails, purchaseOrder.supplier.email])
            };
          },
        }

      );
      form.setValue('recordId', param.id as string)
    }
  }, [param.id, readAccess]);

  useEffect(() => {
    if (document && purchaseOrder) {
      async function convertPdfToFile() {
        const pdfData = await renderComponentToPDF(
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
            isLoading={false}
            payee={purchaseOrder?.payee}
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
  }, [document, purchaseOrder])


  function submit(formData: RecordEmailSchemaType) {
    const { success, data } = recordEmailSchema.safeParse(formData);
    if (success) {
      mutateSharePurchaseOrder(data);
    }
  }


  if (loading) return <Spinner />

  return (
    <AccessContainer hasAccess={readAccess} resource="PURCHASE_ORDER">
      <ScrollArea className="pr-4 h-full">
        {isGettingPurchaseOrder || !purchaseOrder ? <Spinner /> :
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
                              required={false}
                              disabled={!modifyAccess}
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
                              required={false}
                              disabled={!modifyAccess}
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
                    <h2 className="font-semibold">Bon de commande</h2>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Date</span>
                      <span>{formatDateToDashModel(purchaseOrder.createdAt)}</span>
                    </p>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Fournisseur</span>
                      <span>{purchaseOrder.supplier.firstname} {purchaseOrder.supplier.lastname}</span>
                    </p>
                  </div>
                  <div className="space-y-2 py-4 border-neutral-200 border-b">
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span className="font-semibold">Total TTC</span>
                      <span>{formatNumber(purchaseOrder.totalTTC)} {currency}</span>
                    </p>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Montant facturé</span>
                      <span>{formatNumber(purchaseOrder.totalTTC)} {currency}</span>
                    </p>
                    <p className="flex justify-between items-center gap-x-2 text-sm">
                      <span>Payer</span>
                      <span>{formatNumber(purchaseOrder.payee)} {currency}</span>
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
                  {modifyAccess &&
                    <Button variant="primary" disabled={isSharingPurchaseOrder}>{isSharingPurchaseOrder ? <Spinner /> : "Partger"}</Button>
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
