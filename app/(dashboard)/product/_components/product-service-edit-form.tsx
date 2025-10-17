import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import { ProductServiceType } from "@/types/product-service.types";
import { unique, update } from "@/action/product-service.action";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  editProductServiceSchema,
  EditProductServiceSchemaType,
} from "@/lib/zod/product-service.schema";
import {
  productServiceCategories,
  productServiceItemTypes,
  productServiceUnitTypes,
} from "@/lib/data";
import { Switch } from "@/components/ui/switch";

type ProductServiceEditFormProps = {
  closeModal: React.Dispatch<React.SetStateAction<boolean>>;
  onProductServiceUpdated?: () => void;
  id: string;
};

export default function ProductServiceUpdatedForm({
  closeModal,
  onProductServiceUpdated,
  id,
}: ProductServiceEditFormProps) {
  const form = useForm<EditProductServiceSchemaType>({
    resolver: zodResolver(editProductServiceSchema),
    defaultValues: {},
  });

  const {
    mutate: mutateProductService,
    isPending: isLoadingProductService,
    data: productServiceData,
  } = useQueryAction<{ id: string }, RequestResponse<ProductServiceType>>(
    unique,
    () => { },
    "product-service"
  );

  useEffect(() => {
    if (id) {
      mutateProductService({ id });
    }
  }, [id]);

  useEffect(() => {
    if (productServiceData?.data) {
      const initForm = {
        id: productServiceData.data.id,
        companyId: productServiceData.data.companyId,
        itemType: productServiceData.data.type,
        reference: productServiceData.data.reference,
        hasTax: productServiceData.data.hasTax,
        designation: productServiceData.data.designation,
        category: productServiceData.data.category,
        description: productServiceData.data.description,
        unitPrice: productServiceData.data.unitPrice.toString(),
        cost: productServiceData.data.cost.toString(),
        quantity: String(productServiceData.data.quantity),
        unitType: productServiceData.data.unitType,
      };

      form.reset(initForm);
    }
  }, [form, productServiceData]);

  const { mutate, isPending } = useQueryAction<
    EditProductServiceSchemaType,
    RequestResponse<ProductServiceType[]>
  >(update, () => { }, "product-services");

  async function submit(productServiceData: EditProductServiceSchemaType) {
    const { success, data } =
      editProductServiceSchema.safeParse(productServiceData);
    if (!success) return;
    mutate(
      { ...data },
      {
        onSuccess() {
          form.reset();
          if (onProductServiceUpdated) onProductServiceUpdated();
          closeModal(false);
        },
      }
    );
  }

  return (
    <>
      {isLoadingProductService && (
        <Badge variant="secondary" className="text-sm">
          Chargement des données <Spinner size={12} />
        </Badge>
      )}
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
                name="hasTax"
                render={({ field }) => (
                  <FormItem className="flex h-11 flex-row items-center bg-gray justify-between rounded-lg  p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Article taxable</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
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
            <div className="gap-x-2 grid grid-cols-3 w-full">
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
    </>
  );
}
