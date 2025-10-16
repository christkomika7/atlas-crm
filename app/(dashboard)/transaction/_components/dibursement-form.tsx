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
import { useEffect, useState } from "react";
import {
  dibursementSchema,
  DibursementSchemaType,
} from "@/lib/zod/dibursement.schema";
import { Combobox } from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn, formatNumber } from "@/lib/utils";
import useTransactionStore from "@/stores/transaction.store";
import { AllocationType, SourceType, TransactionCategoryType, TransactionDocument, TransactionNatureType, TransactionType } from "@/types/transaction.type";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { createDibursement, getAllocations, getCategories, getDocuments, getNatures, getSources } from "@/action/transaction.action";
import CategoryModal from "../../../../components/modal/category-modal";
import NatureModal from "../../../../components/modal/nature-modal";
import { acceptPayment } from "@/lib/data";
import SourceModal from "../../../../components/modal/source-modal";
import AllocationModal from "../../../../components/modal/allocation-modal";
import { getCollaborators } from "@/action/user.action";
import { UserType } from "@/types/user.types";

type DibursementFormProps = {
  refreshTransaction: () => void
  closeModal: () => void;
};

export default function DibursementForm({ closeModal, refreshTransaction }: DibursementFormProps) {
  const companyId = useDataStore.use.currentCompany();

  const categories = useTransactionStore.use.categories();
  const setCategories = useTransactionStore.use.setCategories();
  const natures = useTransactionStore.use.natures();
  const setNatures = useTransactionStore.use.setNatures();
  const sources = useTransactionStore.use.sources();
  const setSources = useTransactionStore.use.setSources();
  const allocations = useTransactionStore.use.allocations();
  const setAllocations = useTransactionStore.use.setAllocations();

  const [categoryId, setCategoryId] = useState("");
  const [documents, setDocuments] = useState<TransactionDocument[]>([]);
  const [documentType, setDocumentType] = useState<"invoice" | "quote">();
  const [collaborators, setCollaborators] = useState<UserType[]>([]);


  const form = useForm<DibursementSchemaType>({
    resolver: zodResolver(dibursementSchema),
    defaultValues: {
    },
  });

  const {
    mutate: mutateGetCategories,
    isPending: isGettingCategories,
  } = useQueryAction<{ companyId: string }, RequestResponse<TransactionCategoryType[]>>(
    getCategories,
    () => { },
    "categories"
  );

  const {
    mutate: mutateGetNature,
    isPending: isGettingNatures,
  } = useQueryAction<{ categoryId: string }, RequestResponse<TransactionNatureType[]>>(
    getNatures,
    () => { },
    "natures"
  );

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


  const {
    mutate: mutateGetDocuments,
    isPending: isGettingDocuments,
  } = useQueryAction<{ companyId: string }, RequestResponse<TransactionDocument[]>>(
    getDocuments,
    () => { },
    "documents"
  );

  const {
    mutate: mutateGetCollborators,
    isPending: isGettingCollaborators,
  } = useQueryAction<{ id: string }, RequestResponse<UserType[]>>(
    getCollaborators,
    () => { },
    "collaborators"
  );


  const { mutate: mutateCreateDibursement, isPending: isCreatingDibursement } = useQueryAction<
    DibursementSchemaType,
    RequestResponse<TransactionType>
  >(createDibursement, () => { }, "dibursement");



  useEffect(() => {
    if (companyId) {
      mutateGetCategories({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setCategories(data.data)
          }
        },
      })

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


      mutateGetDocuments({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setDocuments(data.data)
          }
        },
      });

      mutateGetCollborators({ id: companyId }, {
        onSuccess(data) {
          if (data.data) {
            setCollaborators(data.data)
          }
        },
      });

      form.reset({
        companyId,
        date: new Date(),
        amountType: "HT",
      });
    }
  }, [companyId]);

  useEffect(() => {
    if (categoryId) {
      mutateGetNature({ categoryId }, {
        onSuccess(data) {
          if (data.data) {
            setNatures(data.data);
          }
        },
      })
    }
  }, [categoryId])



  useEffect(() => {
    if (documentType) {
      form.setValue('documentRefType', documentType);
    }
  }, [documentType])


  function getDocumentType(id: string) {
    const type = documents.find(document => document.id === id)?.type;

    switch (type) {
      case "Facture":
        return "invoice";
      case "Devis":
        return "quote"
    }
  }

  async function submit(dibursementData: DibursementSchemaType) {
    const { success, data } = dibursementSchema.safeParse(dibursementData);
    if (!success) return;
    mutateCreateDibursement(
      { ...data },
      {
        onSuccess() {
          form.reset();
          refreshTransaction();
          closeModal();
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4.5 m-2">
        <div className="space-y-4.5 max-w-full">
          <div className="gap-4.5 grid grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <DatePicker
                      value={field.value}
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
              name="category"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isGettingCategories}
                      datas={categories.map(category => ({
                        id: category.id,
                        label: category.name,
                        value: category.id
                      }))}
                      value={field.value}
                      setValue={(e) => {
                        setCategoryId(e)
                        field.onChange(e)
                      }}
                      placeholder="Catégorie"
                      searchMessage="Rechercher une catégorie"
                      noResultsMessage="Aucune catégorie trouvée."
                      addElement={<CategoryModal />}
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
              name="nature"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isGettingNatures}
                      datas={natures.map(nature => ({
                        id: nature.id,
                        label: nature.name,
                        value: nature.id
                      }))}
                      value={field.value}
                      setValue={field.onChange}
                      placeholder="Nature"
                      searchMessage="Rechercher une nature"
                      noResultsMessage="Aucune nature trouvée."
                      addElement={<NatureModal categoryId={categoryId} />}
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
                    <Combobox
                      isLoading={isGettingDocuments}
                      datas={documents.map(category => ({
                        id: category.id,
                        label: category.reference,
                        more: {
                          type: category.type,
                          price: `${formatNumber(category.price)} ${category.currency}`
                        },
                        value: category.id
                      }))}
                      value={field.value}
                      setValue={e => {
                        setDocumentType(getDocumentType(e as string));
                        field.onChange(e)
                      }}
                      placeholder="Référence du document"
                      searchMessage="Rechercher une référence"
                      noResultsMessage="Aucune référence trouvée."
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
              name="payOnBehalfOf"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isGettingCollaborators}
                      datas={collaborators.map(collaborator => ({
                        id: collaborator.id,
                        label: collaborator.name,
                        value: collaborator.id
                      }))}
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
            {isCreatingDibursement ? <Spinner /> : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
