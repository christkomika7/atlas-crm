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
import { Switch } from "@/components/ui/switch";
import TextInput from "@/components/ui/text-input";
import { businessSectors } from "@/lib/data";
import { paymentSchema, PaymentSchemaType } from "@/lib/zod/payment.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

export default function PaymentForm() {
  const form = useForm<PaymentSchemaType>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      isPaid: false,
    },
  });

  function submit(formData: PaymentSchemaType) {
    const { success, data } = paymentSchema.safeParse(formData);
    if (success) {
      console.log({ data });
    }
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
                    <Label htmlFor="isPaid">Marquer comme payé</Label>
                    <Switch
                      id="isPaid"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    datas={businessSectors}
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
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <DatePicker
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

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            variant="primary"
            className="justify-center max-w-xs"
          >
            {/* {isPending ? <Spinner /> : "Enregistrer"} */}
            Enregistrer le paiement
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="justify-center bg-gray max-w-xs"
          >
            Quitter
          </Button>
        </div>
      </form>
    </Form>
  );
}
