"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TextInput from "@/components/ui/text-input";
import { cn, normalizeName } from "@/lib/utils";
import { taxSchema, TaxSchemaType } from "@/lib/zod/company.schema";
import useTaxStore from "@/stores/tax.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type EditTaxFormProps = {
  close: () => void;
  tax: TaxSchemaType;
};

export default function EditTaxForm({
  close,
  tax,
}: EditTaxFormProps) {

  const taxs = useTaxStore.use.taxs();
  const updateTax = useTaxStore.use.updateTax();
  const currentId = useTaxStore.use.id();

  const form = useForm<TaxSchemaType>({
    resolver: zodResolver(taxSchema),
    defaultValues: tax,
  });

  useEffect(() => {
    form.reset(tax);
  }, [tax]);


  function handleClose() {
    form.reset();
    close();
  }

  function submit(formData: TaxSchemaType) {
    const { success, data } = taxSchema.safeParse(formData);
    if (success) {
      const idx = taxs.findIndex((t) => t.id === currentId);
      if (idx === -1) return;

      const nameKey = normalizeName(data.taxName);
      const conflict = taxs.some((t, i) => i !== idx && normalizeName(t.taxName) === nameKey);
      if (conflict) return toast.error("Le nom de cette taxe est déjà utilisé.");
      updateTax(currentId, data);

      form.reset()
      close();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(submit)(e);
        }}
        className="space-y-4.5 m-2 max-w-xl"
      >
        <FormField
          control={form.control}
          name="taxName"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  design="float"
                  label="Nom de la taxe"
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
          name="taxValue"
          render={({ field }) => (
            <FormItem className="-space-y-2">
              <FormControl>
                <TextInput
                  design="float"
                  label="Valeur de la taxe"
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
          name="cumul"
          render={({ field }) => {
            const selected = field.value ?? [];
            const isSelected = (name: string) =>
              selected.some((item) => item.name === name && item.check);

            const toggleTax = (id: number, name: string) => {
              // Assuming field.value is an array of { name: string; check: boolean }
              const exists = field.value?.some(
                (item) => item.name === name && item.check
              );

              let newValue;
              if (exists) {
                newValue = field.value?.map((item) =>
                  item.name === name ? { ...item, check: false } : item
                );
              } else {
                // If not exists, add or update
                if (field.value?.some((item) => item.name === name)) {
                  newValue = field.value?.map((item) =>
                    item.name === name ? { ...item, check: true } : item
                  );
                } else {
                  newValue = [
                    ...(field.value ?? []),
                    { id, name, check: true },
                  ];
                }
              }
              field.onChange(newValue);
            };

            return (
              <FormItem className="space-y-0.5">
                <FormLabel>Taxes cumulées</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {taxs
                    .filter((t) => t.taxName !== tax.taxName)
                    .map((t, index) => (
                      <FormItem
                        key={t.taxName}
                        className={cn(
                          "flex flex-row items-center gap-2 bg-blue/10 rounded-full w-fit cursor-pointer",
                          {
                            "bg-blue text-white": isSelected(t.taxName),
                          }
                        )}
                      >
                        <FormControl>
                          <Checkbox
                            checked={isSelected(t.taxName)}
                            onCheckedChange={() => toggleTax(index, t.taxName)}
                            className="hidden"
                          />
                        </FormControl>
                        <FormLabel className="px-4 py-2 font-normal text-sm cursor-pointer">
                          {t.taxName}
                        </FormLabel>
                      </FormItem>
                    ))
                    .filter(Boolean)}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex justify-end gap-x-2 pt-2">
          <Button type="submit" variant="primary" className="w-fit">
            Mettre à jour la taxe
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-fit h-12"
            onClick={handleClose}
          >
            Quitter
          </Button>
        </div>
      </form>
    </Form>
  );
}
