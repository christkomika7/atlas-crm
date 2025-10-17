"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import TextInput from "@/components/ui/text-input";
import { cn } from "@/lib/utils";
import { taxSchema, TaxSchemaType } from "@/lib/zod/company.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type AddTaxFormProps = {
  setOpen: (open: boolean) => void;
  taxs: TaxSchemaType[];
  setTaxs: (taxs: TaxSchemaType[]) => void;
};

export default function AddTaxForm({
  setOpen,
  taxs,
  setTaxs,
}: AddTaxFormProps) {

  const form = useForm<TaxSchemaType>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      taxName: "",
      cumul: [],
    },
  });

  function resetForm() {
    form.reset();
  }

  function handleClose() {
    resetForm();
    setOpen(false);
  }

  function onSubmit(formData: TaxSchemaType) {
    const { success, data } = taxSchema.safeParse(formData);
    if (success) {
      const alreadyExists = taxs.some(
        (t) => t.taxName.toLowerCase() === data.taxName.toLowerCase()
      );
      if (!alreadyExists) {
        setTaxs([...taxs, data]);
      }
      resetForm();
      setOpen(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4.5 m-2 max-w-xl"
      >
        {/* Nom de la taxe */}
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

        {/* Valeurs de taxe */}
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

        {/* Taxes cumulées */}
        <FormField
          control={form.control}
          name="cumul"
          render={({ field }) => {
            const selected = field.value ?? [];

            const isSelected = (name: string) =>
              selected.some((item) => item.name === name && item.check);

            const toggleTax = (tax: {
              id: number;
              name: string;
              check: boolean;
            }) => {
              const exists = isSelected(tax.name);
              const newValue = exists
                ? selected.filter((item) => item.id !== tax.id)
                : [...selected, tax];
              field.onChange(newValue.length === 0 ? undefined : newValue);
            };

            return (
              <FormItem className="space-y-0.5">
                <FormLabel>Taxes cumulées</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {taxs.map((t, index) => (
                    <FormItem
                      key={t.taxName}
                      className={cn(
                        "flex flex-row items-center gap-2 bg-gray rounded-full w-fit cursor-pointer",
                        {
                          "bg-blue text-white": isSelected(t.taxName),
                        }
                      )}
                    >
                      <FormControl>
                        <Checkbox
                          checked={isSelected(t.taxName)}
                          onCheckedChange={(e) =>
                            toggleTax({
                              id: index,
                              name: t.taxName,
                              check: Boolean(e),
                            })
                          }
                          className="hidden"
                        />
                      </FormControl>
                      <FormLabel className="px-4 py-2 font-medium text-sm cursor-pointer">
                        {t.taxName}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Actions */}
        <div className="flex justify-end gap-x-2 pt-2">
          <Button type="submit" variant="primary" className="w-fit">
            Ajouter la taxe
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
