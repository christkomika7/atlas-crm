"use client";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { useDataStore } from "@/stores/data.store";
import { DatePicker } from "@/components/ui/date-picker";
import { useEffect } from "react";
import { MultipleSelect } from "@/components/ui/multi-select";
import {
  dibursementSchema,
  DibursementSchemaType,
} from "@/lib/zod/dibursement.schema";
import { Combobox } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DibursementFormProps = {
  closeModal: () => void;
};

export default function DibursementForm({ closeModal }: DibursementFormProps) {
  const companyId = useDataStore.use.currentCompany();

  const form = useForm<DibursementSchemaType>({
    resolver: zodResolver(dibursementSchema),
    defaultValues: {
      amountType: "HT",
    },
  });

  // const { mutate, isPending } = useQueryAction<
  //   DibursementSchemaType,
  //   RequestResponse<DibursementSchemaType>
  // >(create, () => {}, "dibursements");

  useEffect(() => {
    if (companyId) {
      const initForm = {
        companyId,
      };

      form.reset(initForm);
    }
  }, [form, companyId]);

  async function submit(dibursementData: DibursementSchemaType) {
    const { success, data } = dibursementSchema.safeParse(dibursementData);
    if (!success) return;
    console.log({ data });
    // mutate(
    //   { ...data },
    //   {
    //     onSuccess() {
    //       form.reset();
    //       closeModal();
    //     },
    //   }
    // );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
        <div className="space-y-4.5 max-w-full">
          <div className="gap-4.5 grid grid-cols-3">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="text"
                      design="float"
                      label="Référence"
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
              name="date"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <DatePicker
                      label="Date"
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
              name="moov"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={[]}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Type de mouvement"
                      searchMessage="Rechercher un type de mouvement"
                      noResultsMessage="Aucun type trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-4.5 grid grid-cols-3">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={[]}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Catégorie"
                      searchMessage="Rechercher une catégorie"
                      noResultsMessage="Aucune catégorie trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nature"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={[]}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Nature"
                      searchMessage="Rechercher une nature"
                      noResultsMessage="Aucune nature trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-x-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="-space-y-2 w-full">
                    <FormControl>
                      <TextInput
                        type="number"
                        design="float"
                        label="Montant"
                        className="w-full"
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
                name="amountType"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <RadioGroup
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        className="flex -space-x-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="HT"
                            id="HT"
                            className="hidden"
                          />
                          <Label
                            htmlFor="HT"
                            className={cn(
                              "flex bg-gray px-3 py-1 rounded-md h-full",
                              field.value === "HT" && "bg-blue text-white"
                            )}
                          >
                            HT
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="TTC"
                            id="TTC"
                            className="hidden"
                          />
                          <Label
                            htmlFor="TTC"
                            className={cn(
                              "flex bg-gray px-3 py-1 rounded-md h-full",
                              field.value === "TTC" && "bg-blue text-white"
                            )}
                          >
                            TTC
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="gap-4.5 grid grid-cols-3">
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={[]}
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
              name="checkNumber"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
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
              name="documentRef"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="text"
                      design="float"
                      label="Référence du document"
                      value={field.value}
                      handleChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-4.5 grid grid-cols-3">
            <FormField
              control={form.control}
              name="allocation"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={[]}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Allocation"
                      searchMessage="Rechercher une allocation"
                      noResultsMessage="Aucune allocation trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={[]}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Source"
                      searchMessage="Rechercher une source"
                      noResultsMessage="Aucune source trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payOnBehalfOf"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={[]}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Sélectionner un tiers payeur"
                      searchMessage="Rechercher un tiers payeur..."
                      noResultsMessage="Aucun tiers payeur trouvé."
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
              name="description"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="text"
                      design="text-area"
                      label="Description"
                      required={false}
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
              name="comment"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="text"
                      design="text-area"
                      label="Commentaire"
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
        </div>

        <div className="flex justify-center pt-2">
          <Button
            type="submit"
            variant="primary"
            className="justify-center max-w-xs"
          >
            {/* {isPending ? <Spinner /> : "Enregistrer"} */}
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}
