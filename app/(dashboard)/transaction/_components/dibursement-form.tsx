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
import { cn, cutText, formatNumber } from "@/lib/utils";
import useTransactionStore from "@/stores/transaction.store";
import { AllocationType, FiscalObjectType, SourceType, TransactionCategoryType, TransactionDocument, TransactionNatureType, TransactionType } from "@/types/transaction.type";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { createDibursement, getAllocations, getCategories, getDocuments, getFisclaObjects, getNatures, getSources } from "@/action/transaction.action";
import CategoryModal from "../../../../components/modal/category-modal";
import NatureModal from "../../../../components/modal/nature-modal";
import { acceptPayment } from "@/lib/data";
import SourceModal from "../../../../components/modal/source-modal";
import AllocationModal from "../../../../components/modal/allocation-modal";
import { getCollaborators } from "@/action/user.action";
import { ProfileType } from "@/types/user.types";
import { ProjectType } from "@/types/project.types";
import { getallByCompany } from "@/action/project.action";
import { SupplierType } from "@/types/supplier.types";
import { all as getallPartners } from "@/action/supplier.action";
import { ADMINISTRATION_CATEGORY, DIBURSMENT_CATEGORY, FISCAL_NATURE, FISCAL_OBJECT, TRANSACTION_CATEGORIES } from "@/config/constant";
import FiscalObjectModal from "@/components/modal/fiscal-object-modal";
import { $Enums } from "@/lib/generated/prisma";
import { MultipleSelect } from "@/components/ui/multi-select";

type DibursementFormProps = {
  refreshTransaction: () => void
  closeModal: () => void;
};

export default function DibursementForm({ closeModal, refreshTransaction }: DibursementFormProps) {
  const companyId = useDataStore.use.currentCompany();

  const fiscalObjects = useTransactionStore.use.fiscalObjects();
  const setFiscalObjects = useTransactionStore.use.setFiscalObjects();
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
  const [collaborators, setCollaborators] = useState<ProfileType[]>([]);
  const [partners, setPartners] = useState<SupplierType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [category, setCategory] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "check" | "bank-transfer">();
  const [natureId, setNatureId] = useState("");
  const [nature, setNature] = useState("");
  const [fiscalObject, setFiscalObject] = useState("");
  const [currentAmountType, setCurrentAmountType] = useState<$Enums.AmountType>();
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);

  const form = useForm<DibursementSchemaType>({
    resolver: zodResolver(dibursementSchema)
  });

  const {
    mutate: mutateGetCategories,
    isPending: isGettingCategories,
  } = useQueryAction<{ companyId: string, type: "receipt" | "dibursement" }, RequestResponse<TransactionCategoryType[]>>(
    getCategories,
    () => { },
    "categories"
  );

  const {
    mutate: mutateGetFiscalObjects,
    isPending: isGettingFiscalObjects,
  } = useQueryAction<{ companyId: string }, RequestResponse<FiscalObjectType[]>>(
    getFisclaObjects,
    () => { },
    "fiscal-objects"
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
  } = useQueryAction<{ companyId: string, type?: "cash" | "check" | "bank-transfer" }, RequestResponse<SourceType[]>>(
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
  } = useQueryAction<{ companyId: string, type: "receipt" | "dibursement" }, RequestResponse<TransactionDocument[]>>(
    getDocuments,
    () => { },
    "documents"
  );

  const {
    mutate: mutateGetCollborators,
    isPending: isGettingCollaborators,
  } = useQueryAction<{ id: string }, RequestResponse<ProfileType[]>>(
    getCollaborators,
    () => { },
    "collaborators"
  );


  const {
    mutate: mutateGetProjects,
    isPending: isGettingProjects,
  } = useQueryAction<{ companyId: string, projectStatus?: "loading" | "stop" }, RequestResponse<ProjectType[]>>(
    getallByCompany,
    () => { },
    "projects"
  );


  const {
    mutate: mutateGetPartners,
    isPending: isGettingPartners,
  } = useQueryAction<{ id: string }, RequestResponse<SupplierType[]>>(
    getallPartners,
    () => { },
    "suppliers"
  );


  const { mutate: mutateCreateDibursement, isPending: isCreatingDibursement } = useQueryAction<
    DibursementSchemaType,
    RequestResponse<TransactionType>
  >(createDibursement, () => { }, "dibursement");


  useEffect(() => {
    if (companyId) {
      mutateGetCategories({ companyId, type: "dibursement" }, {
        onSuccess(data) {
          if (data.data) {
            setCategories(data.data)
          }
        },
      });

      mutateGetFiscalObjects({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setFiscalObjects(data.data)
          }
        },
      });

      mutateGetProjects({ companyId, projectStatus: "loading" }, {
        onSuccess(data) {
          if (data.data) {
            setProjects(data.data);
          }
        },
      });


      mutateGetPartners({ id: companyId }, {
        onSuccess(data) {
          if (data.data) {
            setPartners(data.data);
          }
        },
      });

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


      mutateGetDocuments({ companyId, type: "dibursement" }, {
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
    mutateGetSources({ companyId, type: paymentMode }, {
      onSuccess(data) {
        if (data.data) {
          setSources(data.data)
        }
      },
    });
  }, [paymentMode])

  function getCategoryData(id: string) {
    const current = categories.find(category => category.id === id);
    setCategory(current?.name || "");
    setCategoryId(id)
  }

  function getNatureData(id: string) {
    const current = natures.find(nature => nature.id === id);
    setNature(current?.name || "");
    setNatureId(id)
  }

  function getFiscalObjectName(id: string) {
    const current = fiscalObjects.find(fiscalObject => fiscalObject.id === id);
    setFiscalObject(current?.name || "");
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
                        getCategoryData(String(e))
                        field.onChange(e)
                      }}
                      placeholder="Catégorie"
                      searchMessage="Rechercher une catégorie"
                      noResultsMessage="Aucune catégorie trouvée."
                      addElement={<CategoryModal type="dibursement" />}
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
                      setValue={(e) => {
                        getNatureData(String(e))
                        field.onChange(e)
                      }}
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

            {ADMINISTRATION_CATEGORY === category && FISCAL_NATURE === nature ?
              <FormField
                control={form.control}
                name="fiscalObject"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        required={true}
                        isLoading={isGettingFiscalObjects}
                        datas={fiscalObjects.map(fiscalObject => ({
                          id: fiscalObject.id,
                          label: `${cutText(fiscalObject.name)}`,
                          value: fiscalObject.id
                        }))}
                        value={field.value || ""}
                        setValue={e => {
                          field.onChange(e)
                          getFiscalObjectName(String(e))
                        }}
                        placeholder="Objet du paiement"
                        searchMessage="Rechercher un objet de paiement"
                        noResultsMessage="Aucun objet trouvé trouvé."
                        addElement={<FiscalObjectModal />}

                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> :
              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        required={false}
                        isLoading={isGettingProjects}
                        datas={projects.map(project => ({
                          id: project.id,
                          label: `${cutText(project.client.firstname + " " + project.client.lastname)} - ${project.name}`,
                          value: project.id
                        }))}
                        value={field.value || ""}
                        setValue={e => {
                          field.onChange(e)
                        }}
                        placeholder="Projet"
                        searchMessage="Rechercher un projet"
                        noResultsMessage="Aucun projet trouvé."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            }

            <div className="flex gap-x-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="-space-y-2 w-full">
                    <FormControl>
                      <TextInput
                        min={0}
                        max={maxAmount}
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
                        {(
                          FISCAL_OBJECT === fiscalObject ||
                          currentAmountType === undefined ||
                          currentAmountType === "HT"
                        ) && (
                            <div className="flex items-center max-h-11 space-x-2">
                              <RadioGroupItem value="HT" id="HT" className="hidden" />
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
                          )}

                        {(
                          FISCAL_OBJECT !== fiscalObject &&
                          (currentAmountType === undefined ||
                            currentAmountType === "TTC")
                        ) && (
                            <div className="flex items-center max-h-11 space-x-2">
                              <RadioGroupItem value="TTC" id="TTC" className="hidden" />
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
                          )}
                      </RadioGroup>

                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="gap-4.5 grid grid-cols-[1fr_1fr_1.5fr]">
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      datas={acceptPayment}
                      value={field.value}
                      setValue={e => {
                        setPaymentMode(e as "check" | "cash" | "bank-transfer");
                        field.onChange(e);
                      }}
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
                      required={false}
                      height="h-11"
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
                      required={false}
                      isLoading={isGettingDocuments}
                      datas={documents.map(document => ({
                        id: document.id,
                        label: `${document.reference}`,
                        more: {
                          type: document.type,
                          price: `${formatNumber(document.price)} ${document.currency}`
                        },
                        value: document.id
                      }))}
                      value={field.value as string}
                      setValue={e => {
                        const doc = documents.find(d => d.id === e);
                        setCurrentAmountType(doc?.amountType);
                        if (doc) {
                          setMaxAmount(Number(doc.payee));
                          form.setValue("amountType", doc.amountType);
                        } else {
                          setMaxAmount(undefined)
                        }
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
          <div className={cn("gap-4.5 grid", TRANSACTION_CATEGORIES.includes(category) ? "grid-cols-3" : "grid-cols-2")}>
            <FormField
              control={form.control}
              name="partner"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <MultipleSelect

                      isLoading={isGettingPartners}
                      label="Partenaire"
                      options={partners.map(partner => ({
                        id: partner.id,
                        label: `${cutText(partner.firstname + " " + partner.lastname)} - ${partner.companyName}`,
                        value: partner.id
                      }))}
                      value={partners.map(partner =>
                      ({
                        id: partner.id,
                        label: `${cutText(partner.firstname + " " + partner.lastname)} - ${partner.companyName}`,
                        value: partner.id
                      }))
                        .filter(opt => field.value?.includes(opt.value))}
                      onChange={opts => field.onChange(opts.map(opt => opt.value))}
                      placeholder="Rechercher un partenaire"
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
                      required={DIBURSMENT_CATEGORY.includes(category)}
                      isLoading={isGettingAllocations}
                      datas={allocations.map(allocation => ({
                        id: allocation.id,
                        label: allocation.name,
                        value: allocation.id
                      }))}
                      value={field.value || ""}
                      setValue={field.onChange}
                      placeholder="Allocation"
                      searchMessage="Rechercher une allocation"
                      noResultsMessage="Aucune allocation trouvée."
                      addElement={<AllocationModal natureId={natureId} />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {TRANSACTION_CATEGORIES.includes(category) &&
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <DatePicker
                        label="Période"
                        mode="range"
                        value={
                          field.value?.from && field.value.to
                            ? {
                              from: new Date(field.value.from),
                              to: new Date(field.value.to),
                            }
                            : undefined
                        }
                        onChange={(value) => {
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            }

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
                      addElement={<SourceModal sourceType={paymentMode} />}
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
                      className="h-11"
                      required={false}
                      isLoading={isGettingCollaborators}
                      datas={collaborators.map(collaborator => ({
                        id: collaborator.id,
                        label: `${collaborator.firstname} ${collaborator.lastname}`,
                        value: collaborator.id
                      }))}
                      value={field.value ?? ""}
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
