import { createdPayment, unique } from "@/action/purchase-order.action";
import { getAllocations, getSources } from "@/action/transaction.action";
import AllocationModal from "@/components/modal/allocation-modal";
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
import { purchaseOrderPaymentSchema, PurchaseOrderPaymentSchemaType } from "@/lib/zod/payment.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { AllocationType, SourceType } from "@/types/transaction.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Decimal } from "decimal.js";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type PaymentFormProps = {
  purchaseOrderId: string;
  closeModal: () => void;
  refresh(): void;
}

export default function PaymentForm({ purchaseOrderId, closeModal, refresh }: PaymentFormProps) {
  const companyId = useDataStore.use.currentCompany();

  const [isPaid, setIsPaid] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderType>();

  const sources = useTransactionStore.use.sources();
  const setSources = useTransactionStore.use.setSources();

  const allocations = useTransactionStore.use.allocations();
  const setAllocations = useTransactionStore.use.setAllocations();

  const form = useForm<PurchaseOrderPaymentSchemaType>({
    resolver: zodResolver(purchaseOrderPaymentSchema),
    defaultValues: {
      isPaid: false,
      amount: 0,
      date: new Date()
    },
  });

  const { mutate: mutateGettingPayment, isPending: isGettingPayment } = useQueryAction<
    { id: string },
    RequestResponse<PurchaseOrderType>
  >(unique, () => { }, "purchase-order");

  const {
    mutate: mutateGetSources,
    isPending: isGettingSources,
  } = useQueryAction<{ companyId: string }, RequestResponse<SourceType[]>>(
    getSources,
    () => { },
    "sources"
  );

  const {
    mutate: mutateGetAllocations,
    isPending: isGettingAllocations,
  } = useQueryAction<{ companyId: string }, RequestResponse<AllocationType[]>>(
    getAllocations,
    () => { },
    "allocations"
  );




  const { mutate: mutateCreatePayment, isPending: isCreatingPayment } = useQueryAction<
    PurchaseOrderPaymentSchemaType,
    RequestResponse<null>
  >(createdPayment, () => { }, "payment");


  useEffect(() => {
    if (companyId) {
      mutateGetSources({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setSources(data.data)
          }
        },
      });

      mutateGetAllocations({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setAllocations(data.data)
          }
        },
      });

    }
  }, [companyId]);

  useEffect(() => {
    if (purchaseOrderId) {
      mutateGettingPayment({ id: purchaseOrderId }, {
        onSuccess(data) {
          if (data.data) {
            setPurchaseOrder(data.data);
          }
        },
      })

      form.setValue("recordId", purchaseOrderId);
    }
  }, [purchaseOrderId])


  useEffect(() => {
    if (isPaid && purchaseOrder) {
      const amountType = purchaseOrder.amountType;
      const ttc = purchaseOrder.totalTTC ? new Decimal(purchaseOrder.totalTTC) : new Decimal(0);
      const ht = purchaseOrder.totalHT ? new Decimal(purchaseOrder.totalHT) : new Decimal(0);
      const payee = purchaseOrder.payee ? new Decimal(purchaseOrder.payee) : new Decimal(0);
      if (amountType === "TTC") {
        return form.setValue('amount', ttc.minus(payee).toNumber());
      }
      return form.setValue('amount', ht.minus(payee).toNumber());

    }
    form.setValue("amount", 0);
  }, [isPaid])


  function submit(formData: PurchaseOrderPaymentSchemaType) {
    const { success, data } = purchaseOrderPaymentSchema.safeParse(formData);
    if (purchaseOrder?.isPaid) return toast.error("Impossible d’effectuer cette action : le bon de commande est déjà payée")
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
                      setValue={field.onChange}
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
                      addElement={<SourceModal />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allocation"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isGettingAllocations}
                      datas={allocations.map(allocation => ({
                        id: allocation.id,
                        label: allocation.name,
                        value: allocation.id
                      }))}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Allocation"
                      searchMessage="Rechercher une allocation"
                      noResultsMessage="Aucune allocation trouvée."
                      addElement={<AllocationModal />}
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
          </div>

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
            disabled={isCreatingPayment}
            className="justify-center max-w-xs"
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
