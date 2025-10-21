import { createdPayment, unique } from "@/action/invoice.action";
import { getSources } from "@/action/transaction.action";
import SourceModal from "@/components/modal/source-modal";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { acceptPayment } from "@/lib/data";
import { invoicePaymentSchema, InvoicePaymentSchemaType } from "@/lib/zod/payment.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { InvoiceType } from "@/types/invoice.types";
import { SourceType } from "@/types/transaction.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Decimal } from "decimal.js";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type PaymentFormProps = {
  invoiceId: string;
  closeModal: () => void;
  refresh(): void;
}

export default function PaymentForm({ invoiceId, closeModal, refresh }: PaymentFormProps) {
  const companyId = useDataStore.use.currentCompany();

  const [paymentMode, setPaymentMode] = useState<"check" | "cash" | "bank-transfer">();
  const [isPaid, setIsPaid] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceType>();

  const sources = useTransactionStore.use.sources();
  const setSources = useTransactionStore.use.setSources();

  const form = useForm<InvoicePaymentSchemaType>({
    resolver: zodResolver(invoicePaymentSchema),
    defaultValues: {
      isPaid: false,
      amount: 0,
      date: new Date()
    },
  });

  const { mutate: mutateGettingPayment, isPending: isGettingPayment } = useQueryAction<
    { id: string },
    RequestResponse<InvoiceType>
  >(unique, () => { }, "invoice");

  const {
    mutate: mutateGetSources,
    isPending: isGettingSources,
  } = useQueryAction<{ companyId: string, type?: "cash" | "check" | "bank-transfer" }, RequestResponse<SourceType[]>>(
    getSources,
    () => { },
    "sources"
  );

  const { mutate: mutateCreatePayment, isPending: isCreatingPayment } = useQueryAction<
    InvoicePaymentSchemaType,
    RequestResponse<null>
  >(createdPayment, () => { }, "payment");

  useEffect(() => {
    if (companyId) {
      mutateGetSources({ companyId, type: paymentMode }, {
        onSuccess(data) {
          if (data.data) {
            setSources(data.data)
          }
        },
      })

    }
  }, [companyId, paymentMode]);

  useEffect(() => {
    if (invoiceId) {
      mutateGettingPayment({ id: invoiceId }, {
        onSuccess(data) {
          if (data.data) {
            setInvoice(data.data);
          }
        },
      })

      form.setValue("recordId", invoiceId)
    }
  }, [invoiceId])


  useEffect(() => {
    if (isPaid && invoice) {
      const amountType = invoice.amountType;
      const ttc = invoice.totalTTC ? new Decimal(invoice.totalTTC) : new Decimal(0);
      const ht = invoice.totalHT ? new Decimal(invoice.totalHT) : new Decimal(0);
      const payee = invoice.payee ? new Decimal(invoice.payee) : new Decimal(0);
      if (amountType === "TTC") {
        return form.setValue('amount', ttc.minus(payee).toNumber());
      }
      return form.setValue('amount', ht.minus(payee).toNumber());

    }
    form.setValue("amount", 0);
  }, [isPaid])


  function submit(formData: InvoicePaymentSchemaType) {
    const { success, data } = invoicePaymentSchema.safeParse(formData);
    if (invoice?.isPaid) return toast.error("Impossible d’effectuer cette action : la facture est déjà payée")
    if (success) {
      if (data.amount === 0) return toast.error("Veuillez saisir un montant supérieur à zéro")
      mutateCreatePayment(data, {
        onSuccess() {
          refresh()
          closeModal()
        },
      })
    }
  }

  if (isGettingPayment) {
    return <Spinner />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
        <div className="space-y-4.5 max-w-full">
          <FormField
            control={form.control}
            name="isPaid"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <div className="flex flex-col space-y-2 p-2 rounded-lg">
                    <Label htmlFor="isPaid">Paiement total</Label>
                    <Switch
                      id="isPaid"
                      checked={field.value}
                      onCheckedChange={(e) => {
                        setIsPaid(e)
                        field.onChange(e)
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="gap-4.5 grid grid-cols-2">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      type="number"
                      label="Montant"
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
              name="mode"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={acceptPayment}
                      value={field.value}
                      setValue={e => {
                        setPaymentMode(e as "check" | "cash" | "bank-transfer")
                        field.onChange(e)
                      }}
                      placeholder="Mode de paiement"
                      searchMessage="Rechercher un mode de paiement"
                      noResultsMessage="Aucun mode de paiement trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="gap-4.5 grid grid-cols-2">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isGettingSources}
                      datas={sources.map(source => ({
                        id: source.id,
                        label: source.name,
                        value: source.id
                      }))}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Source"
                      searchMessage="Rechercher une source"
                      noResultsMessage="Aucune source trouvée."
                      addElement={<SourceModal sourceType={paymentMode} />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      label="Date du paiement"
                      mode="single"
                      onChange={(e) => field.onChange(e as Date)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="checkNumber"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    required={false}
                    type="text"
                    design="float"
                    label="Numéro de chèque"
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
            name="information"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    design="float"
                    label="Information supplémentaire"
                    required={false}
                    value={field.value}
                    handleChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-center pt-2 gap-x-4">
          <Button
            type="submit"
            variant="primary"
            className="justify-center max-w-xs"
            disabled={isCreatingPayment}
          >
            {isCreatingPayment ? <Spinner /> : " Enregistrer le paiement"}

          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault()
              closeModal()
            }}
            type="submit"
            variant="primary"
            className="justify-center bg-neutral-100 max-w-xs text-black"
          >
            Quitter
          </Button>
        </div>
      </form>
    </Form>
  );
}
