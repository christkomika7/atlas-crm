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
import TextInput from "@/components/ui/text-input";
import {
  invoiceEmailSchema,
  InvoiceEmailSchemaType,
} from "@/lib/zod/invoice-email.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function ShareTab() {
  const form = useForm<InvoiceEmailSchemaType>({
    resolver: zodResolver(invoiceEmailSchema),
    defaultValues: {},
  });

  function submit(formData: InvoiceEmailSchemaType) {
    const { success, data } = invoiceEmailSchema.safeParse(formData);
    if (success) {
      console.log({ data });
    }
  }

  return (
    <ScrollArea className="pr-4 h-full">
      <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
        <div className="space-y-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submit)}
              className="space-y-4.5 m-2 max-w-xl"
            >
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
            </form>
          </Form>
        </div>
        <div className="space-y-2">
          <div className="space-y-2 py-4 border-neutral-200 border-b">
            <h2 className="font-semibold">Facture</h2>
            <p className="flex justify-between items-center gap-x-2 text-sm">
              <span>Date</span>
              <span>12/02/2025</span>
            </p>
            <p className="flex justify-between items-center gap-x-2 text-sm">
              <span>Client</span>
              <span>Christ Komika</span>
            </p>
          </div>
          <div className="space-y-2 py-4 border-neutral-200 border-b">
            <p className="flex justify-between items-center gap-x-2 text-sm">
              <span className="font-semibold">Total TTC</span>
              <span>0 FCFA</span>
            </p>
            <p className="flex justify-between items-center gap-x-2 text-sm">
              <span>Payé</span>
              <span>0 FCFA</span>
            </p>
            <p className="flex justify-between items-center gap-x-2 text-sm">
              <span>Payer</span>
              <span>0 FCFA</span>
            </p>
          </div>
          <p className="flex justify-between items-center gap-x-2 text-sm">
            Mark as paid
          </p>
          <Button variant="primary">Send statement</Button>
        </div>
      </div>
    </ScrollArea>
  );
}
