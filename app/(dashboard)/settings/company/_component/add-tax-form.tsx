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
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multi-selector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import TextInput from "@/components/ui/text-input";
import { cn } from "@/lib/utils";
import { taxSchema, TaxSchemaType } from "@/lib/zod/company.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

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
  const [check, setCheck] = useState<"TTC" | "HT">("TTC");

  const form = useForm<TaxSchemaType>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      taxName: "",
      taxValue: [],
      taxType: "TTC",
      cumul: [],
      hasApplicableToAll: false,
    },
  });

  function resetForm() {
    form.reset();
    setCheck("TTC");
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
                <MultipleSelector
                  value={field.value.map((v) => ({ label: v, value: v }))}
                  placeholder="Ajouter des taux (ex: 10%)"
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

        {/* Type de taxe */}
        <FormField
          control={form.control}
          name="taxType"
          render={({ field }) => (
            <FormItem className="space-y-0.5">
              <FormLabel>Type de taxe</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={(val: "TTC" | "HT") => {
                    setCheck(val);
                    field.onChange(val);
                  }}
                  className="flex bg-neutral-50 rounded-lg w-fit h-12 overflow-hidden"
                >
                  <div className={cn(check === "TTC" && "bg-blue text-white")}>
                    <RadioGroupItem value="TTC" id="TTC" className="hidden" />
                    <Label
                      htmlFor="TTC"
                      className="flex items-center p-3 w-28 h-full cursor-pointer"
                    >
                      Comprise(s)
                    </Label>
                  </div>
                  <div className={cn(check === "HT" && "bg-blue text-white")}>
                    <RadioGroupItem value="HT" id="HT" className="hidden" />
                    <Label
                      htmlFor="HT"
                      className="flex items-center p-3 w-28 h-full cursor-pointer"
                    >
                      Hors taxe
                    </Label>
                  </div>
                </RadioGroup>
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

        {/* Appliquer à tous */}
        <FormField
          control={form.control}
          name="hasApplicableToAll"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasApplicableToAll"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="hasApplicableToAll">
                    Appliquer cette taxe à tous les articles
                  </Label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
