import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import { useDataStore } from "@/stores/data.store";
import {
  productServiceSchema,
  ProductServiceSchemaType,
} from "@/lib/zod/product-service.schema";
import { create } from "@/action/product-service.action";
import { useEffect } from "react";
import { ProductServiceType } from "@/types/product-service.types";
import {
  productServiceCategories,
  productServiceItemTypes,
  productServiceUnitTypes,
} from "@/lib/data";

type ProductServiceFormProps = {
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  onProductServiceAdded?: () => void;
};

export default function ProductServiceForm({
  closeModal,
  onProductServiceAdded,
}: ProductServiceFormProps) {
  const id = useDataStore.use.currentCompany();

  const form = useForm<ProductServiceSchemaType>({
    resolver: zodResolver(productServiceSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (id) {
      const initForm = {
        companyId: id,
      };

      form.reset(initForm);
    }
  }, [form, id]);

  const { mutate, isPending } = useQueryAction<
    ProductServiceSchemaType,
    RequestResponse<ProductServiceType[]>
  >(create, () => { }, "product-services");

  async function submit(productServiceData: ProductServiceSchemaType) {
    const { success, data } =
      productServiceSchema.safeParse(productServiceData);
    if (!success) return;
    if (id) {
      mutate(
        { ...data },
        {
          onSuccess() {
            form.reset();
            if (onProductServiceAdded) onProductServiceAdded();
            closeModal(false);
          },
        }
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
        <div className="space-y-4.5 max-w-full">
          <div className="gap-x-2 grid grid-cols-3 w-full">
            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={productServiceItemTypes}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Sélectionner un type"
                      searchMessage="Rechercher un type (produit ou service)"
                      noResultsMessage="Aucun type correspondant trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
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
              name="category"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={productServiceCategories}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Sélectionner une catégorie"
                      searchMessage="Rechercher une catégorie"
                      noResultsMessage="Aucune catégorie trouvée."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-x-2 grid grid-cols-3 w-full">
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="number"
                      design="float"
                      label="Prix unitaire"
                      value={field.value}
                      handleChange={(e) => field.onChange(String(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="number"
                      design="float"
                      label="Quantité"
                      value={field.value}
                      handleChange={(e) => field.onChange(String(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="number"
                      design="float"
                      label="Coût"
                      value={field.value}
                      handleChange={(e) => field.onChange(String(e))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="gap-x-2 grid grid-cols-2 w-full">
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="float"
                      label="Désignation"
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
              name="unitType"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={productServiceUnitTypes}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Sélectionner un type unité"
                      searchMessage="Rechercher un type unité"
                      noResultsMessage="Aucun type unité trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <TextInput
                    design="text-area"
                    label="Description"
                    value={field.value}
                    required={false}
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
            {isPending ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
