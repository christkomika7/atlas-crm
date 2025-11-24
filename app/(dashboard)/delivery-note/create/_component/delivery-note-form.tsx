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
import { RequestResponse } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { all as getClients, unique as getClient } from "@/action/client.action";
import { allByClient } from "@/action/project.action";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import { useDataStore } from "@/stores/data.store";
import { ClientType } from "@/types/client.types";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ProjectType } from "@/types/project.types";
import ItemModal from "./item-modal";
import useItemStore, { LocationBillboardDateType } from "@/stores/item.store";
import useProjectStore from "@/stores/project.store";
import ProjectModal from "../../_component/project-modal";
import useClientIdStore from "@/stores/client-id.store";
import { unique } from "@/action/document.action";
import { ModelDocumentType } from "@/types/document.types";
import { useRouter } from "next/navigation";
import { CompanyType } from "@/types/company.types";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import ItemList from "./item-list";
import useTabStore from "@/stores/tab.store";
import { DiscountType } from "@/types/tax.type";
import { cn, generateAmaId, parseItem, parseItems } from "@/lib/utils";
import { toast } from "sonner";
import { ProductServiceType } from "@/types/product-service.types";
import { getAllProductServices } from "@/action/product-service.action";
import Decimal from "decimal.js";
import { deliveryNoteSchema, DeliveryNoteSchemaType } from "@/lib/zod/delivery-note.schema";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { createDeliveryNote, deliveryNoteNumber } from "@/action/delivery-note.action";
import DeliveryNoteInfo from "./delivery-note-info";
import { DELIVERY_NOTE_PREFIX } from "@/config/constant";
import { getBillboardItemLocations } from "@/action/delivery-note.action";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function DeliveryNoteForm() {
  const router = useRouter();

  const [amountType, setAmountType] = useState<"HT" | "TTC">("TTC");
  const [company, setCompany] = useState<CompanyType>();
  const [paymentLimit, setPaymentLimit] = useState("");

  const companyId = useDataStore.use.currentCompany();

  const { calculate } = useCalculateTaxe();

  const currency = useDataStore.use.currency();
  const setTab = useTabStore.use.setTab();

  const clientId = useClientIdStore.use.clientId();
  const setClientId = useClientIdStore.use.setClientId();
  const [clientDiscount, setClientDiscount] = useState<DiscountType>({ discount: 0, discountType: "purcent" });
  const [client, setClient] = useState<ClientType>();

  const items = useItemStore.use.items();
  const updateDiscount = useItemStore.use.updateDiscount();
  const clearItem = useItemStore.use.clearItem();

  const setItemQuantities = useItemStore.use.setItemQuantity();

  const setProject = useProjectStore.use.setProject();
  const projects = useProjectStore.use.projects();

  const locationBillboardDate = useItemStore.use.locationBillboardDate();
  const setLocationBillboard = useItemStore.use.setLocationBillboard();

  const form = useForm<DeliveryNoteSchemaType>({
    resolver: zodResolver(deliveryNoteSchema)
  });

  const {
    mutate: mutateClients,
    isPending: isLoadingClients,
    data: clientsData,
  } = useQueryAction<{ id: string }, RequestResponse<ClientType[]>>(
    getClients,
    () => { },
    "clients"
  );

  const { mutate: mutateClient } = useQueryAction<
    { id: string },
    RequestResponse<ClientType>
  >(getClient, () => { }, "client");

  const { mutate, isPending } = useQueryAction<
    DeliveryNoteSchemaType,
    RequestResponse<DeliveryNoteType>
  >(createDeliveryNote, () => { }, "delivery-note");

  const {
    mutate: mutateGetDeliveryNoteNumber,
    isPending: isGettingDeliveryNoteNumber,
    data: deliveryNoteNumberData,
  } = useQueryAction<{ companyId: string }, RequestResponse<number>>(
    deliveryNoteNumber,
    () => { },
    "delivery-note-number"
  );

  const {
    mutate: mutateGetDocument,
    isPending: isGettingDocument,
    data: documentData,
  } = useQueryAction<{ id: string }, RequestResponse<ModelDocumentType>>(
    unique,
    () => { },
    "document"
  );

  const {
    mutate: mutateGetItemLocations,
  } = useQueryAction<{ companyId: string }, RequestResponse<LocationBillboardDateType[]>>(
    getBillboardItemLocations,
    () => { },
    "item-locations"
  );

  const {
    mutate: mutateProject,
    isPending: isLoadingProject,
    data: projectData,
  } = useQueryAction<{ clientId: string }, RequestResponse<ProjectType[]>>(
    allByClient,
    () => { },
    "projects"
  );


  const { mutate: mutateGetProductService } = useQueryAction<
    { companyId: string; },
    RequestResponse<ProductServiceType[]>
  >(getAllProductServices, () => { }, "product-services");


  useEffect(() => {
    clearItem();
  }, []);

  useEffect(() => {
    if (companyId) {
      form.setValue("companyId", companyId);
      form.setValue("amountType", "TTC");
      form.setValue("discount", "0");

      mutateGetProductService({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            const mapped = data.data.map(p => ({
              id: p.id,
              quantity: p.quantity
            }))
            setItemQuantities(mapped);
          }
        },
      });

      mutateClients({ id: companyId });

      mutateGetDeliveryNoteNumber({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            form.setValue("deliveryNoteNumber", data.data)
          }
        },
      });

      mutateGetDocument(
        { id: companyId },
        {
          onSuccess(data) {
            if (data.data) {
              setCompany(data.data.company);
            }
          },
        }
      );

      mutateGetItemLocations({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setLocationBillboard(data.data);
          }
        },
      });
    }
  }, [companyId]);

  useEffect(() => {
    if (clientId) {
      mutateProject({ clientId });
      mutateClient(
        { id: clientId },
        {
          onSuccess(data) {
            if (data.data) {
              setPaymentLimit(data.data.paymentTerms);
              // updateDiscount(data.data.discount);
            }
          },
        }
      );
    }
  }, [clientId]);

  useEffect(() => {
    form.setValue("paymentLimit", paymentLimit);
  }, [paymentLimit])

  useEffect(() => {
    if (clientsData?.data && clientId) {
      setClient(clientsData.data.find((c) => c.id === clientId));
    }
  }, [clientId, clientsData]);

  useEffect(() => {
    if (projectData?.data) {
      setProject(projectData.data);
    }
  }, [projectData]);


  useEffect(() => {
    if (items.length > 0) {
      form.setValue("item", {
        billboards: items
          .filter((item) => item.itemType === "billboard")
          .map((item) => ({
            id: item.id,
            reference: item.reference,
            name: item.name,
            hasTax: item.hasTax,
            quantity: item.quantity,
            price: new Decimal(item.price),
            status: item.status,
            itemType: item.itemType,
            updatedPrice: calculate({
              items: [parseItem(item)],
              taxes: company?.vatRates ?? [],
              amountType,
            }).totalWithoutTaxes,
            locationStart: item.locationStart ?? new Date(),
            locationEnd: item.locationEnd ?? new Date(),
            discountType: item.discountType,
            description: item.description,
            discount: item.discount,
            billboardId: item.billboardId,
            currency: item.currency,
          })),
        productServices: items
          .filter((item) => item.itemType !== "billboard")
          .map((item) => ({
            reference: item.reference,
            name: item.name,
            hasTax: item.hasTax,
            quantity: item.quantity,
            price: new Decimal(item.price),
            updatedPrice:
              calculate({
                items: [parseItem(item)],
                taxes: company?.vatRates ?? [],
                amountType: amountType,
              }).totalWithoutTaxes
            ,
            locationStart: item.locationStart ?? new Date(),
            locationEnd: item.locationEnd ?? new Date(),
            itemType: item.itemType,
            discountType: item.discountType,
            description: item.description,
            discount: String(item.discount),
            productServiceId: item.productServiceId,
            currency: item.currency,
          })),
      });
      return;
    }
    form.setValue("item", {
      billboards: [],
      productServices: [],
    });
  }, [items]);

  const totals = useMemo(() => {
    const HTPrice = calculate({
      items: parseItems(items),
      taxes: company?.vatRates ?? [],
      amountType: amountType,
    }).totalWithoutTaxes;

    const TTCPrice = calculate({
      items: parseItems(items),
      taxes: company?.vatRates ?? [],
      amountType: amountType,
      discount: [clientDiscount.discount || 0, clientDiscount.discountType]
    }).totalWithTaxes

    return { HTPrice, TTCPrice };
  }, [items, company?.vatRates, clientDiscount]);

  useEffect(() => {
    form.setValue("totalHT", totals.HTPrice);
    form.setValue("totalTTC", totals.TTCPrice);
    form.setValue("discount", String(clientDiscount.discount));
    form.setValue("discountType", clientDiscount.discountType);
  }, [totals, clientDiscount]);

  useEffect(() => {
    if (client) {
      setClientDiscount({
        discount: client.discount.includes("%")
          ? Number(client.discount.split("%")[0])
          : Number(client.discount),
        discountType: "purcent",
      });
    }
  }, [client]);

  const submit = useCallback(
    async (deliveryNoteData: DeliveryNoteSchemaType) => {
      const { success, data } = deliveryNoteSchema.safeParse(deliveryNoteData);

      if (!success) return toast.error("Merci de compléter tous les champs obligatoires.");
      mutate(data, {
        onSuccess(data) {
          if (data.data) {
            setTab("action-delivery-note-tab", 1);
            router.push(`/delivery-note/${data.data.id}`);
          }
        },
      });
    },
    [mutate, form, router]
  );
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="gap-x-4 space-y-4.5 grid grid-cols-[1.5fr_1fr] m-2"
      >
        <div className="space-y-4.5 max-w-lg">
          <div className="space-y-2">
            <h2 className="font-semibold">Client</h2>
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isLoadingClients}
                      datas={
                        clientsData?.data?.map((client) => ({
                          id: client.id,
                          label: `${client.companyName} - ${client.firstname} ${client.lastname}`,
                          value: client.id,
                        })) ?? []
                      }
                      value={field.value}
                      setValue={(e) => {
                        setClientId(e as string);
                        field.onChange(e);
                      }}
                      placeholder="Sélectionner un client"
                      searchMessage="Rechercher un client"
                      noResultsMessage="Aucun client trouvé."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="amountType"
            render={({ field }) => (
              <FormItem className="-space-y-2">
                <FormControl>
                  <div className="flex flex-col space-y-1">
                    <div>
                      <Label className="text-sm">Mode paiement</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={cn("text-sm font-medium", field.value === "HT" ? "text-foreground" : "text-muted-foreground")}>
                        HT
                      </div>
                      <Switch checked={field.value === "TTC"} onCheckedChange={e => {
                        const updatedAmountType = e ? "TTC" : "HT";
                        setAmountType(updatedAmountType);
                        field.onChange(updatedAmountType);
                      }} />
                      <div className={cn("text-sm font-medium", field.value === "TTC" ? "text-foreground" : "text-muted-foreground")}>
                        TTC
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <h2 className="font-semibold">
              Article{items.length > 1 && "s"} ({items.length})
            </h2>
            <div className="space-y-2">
              {items.map((item) => (
                <ItemList key={item.itemType === "billboard" ? item.billboardId : item.productServiceId} item={item} calculate={calculate} taxes={company?.vatRates ?? []} locationBillboardDate={locationBillboardDate} amountType={amountType} />
              ))}
            </div>

            <FormField
              control={form.control}
              name="item"
              render={() => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <ItemModal />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold">Pièce jointe</h2>
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      type="file"
                      multiple={true}
                      design="float"
                      label="Document(s)"
                      required={false}
                      value={field.value}
                      handleChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold">Projet</h2>
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isLoadingProject}
                      datas={projects.map(({ id, name, status }) => ({
                        id: id,
                        label: name,
                        value: id,
                        color:
                          status === "BLOCKED"
                            ? "bg-red"
                            : status === "TODO"
                              ? "bg-neutral-200"
                              : status === "IN_PROGRESS"
                                ? "bg-blue"
                                : "bg-emerald-500",
                      }))}
                      value={field.value ?? ""}
                      setValue={(e) => {
                        field.onChange(e);
                      }}
                      placeholder="Sélectionner un projet"
                      searchMessage="Rechercher un projet"
                      noResultsMessage="Aucun projet trouvé."
                      addElement={<ProjectModal clientId={clientId} />}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <h2 className="font-semibold">Détails des paiements</h2>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <TextInput
                      design="text-area"
                      required={false}
                      label="Note"
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
        <div className="space-y-4.5 max-w-full">
          <DeliveryNoteInfo isGettingDocument={isGettingDocument} isGettingDeliveryNoteNumber={isGettingDeliveryNoteNumber}
            reference={`${documentData?.data?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(Number(deliveryNoteNumberData?.data || 0), false)}`}
            discount={clientDiscount}
            setDiscount={setClientDiscount}
            currency={currency}
            calculate={calculate}
            taxes={company?.vatRates ?? []}
            items={items}
            paymentLimit={paymentLimit}
            setPaymentLimit={setPaymentLimit}
            TTCPrice={totals.TTCPrice}
            HTPrice={totals.HTPrice}
            amountType={amountType}
          />
          <div className="flex justify-center pt-2">
            <Button disabled={isPending} type="submit" variant="primary" className="justify-center">
              {isPending ? <Spinner /> : "Enregistrer"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
