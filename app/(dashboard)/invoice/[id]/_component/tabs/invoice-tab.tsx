"use client";

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
import { useDataStore } from "@/stores/data.store";
import { ClientType } from "@/types/client.types";
import { invoiceUpdateSchema, InvoiceUpdateSchemaType } from "@/lib/zod/invoice.schema";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ProjectType } from "@/types/project.types";
import useItemStore, { LocationBillboardDateType } from "@/stores/item.store";
import useProjectStore from "@/stores/project.store";
import useClientIdStore from "@/stores/client-id.store";


import { ModelDocumentType } from "@/types/document.types";
import { useParams } from "next/navigation";
import { InvoiceType } from "@/types/invoice.types";
import { CompanyType } from "@/types/company.types";

import { all as getClients, unique as getClient } from "@/action/client.action";
import { allByClient } from "@/action/project.action";
import { getBillboardItemLocations, unique as getUniqueInvoice, update as updateInvoice } from "@/action/invoice.action";
import { unique as getDocument } from "@/action/document.action";
import ProjectModal from "../../../_component/project-modal";
import { DownloadIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import ItemList from "../../../create/_component/item-list";
import InvoiceInfo from "../../../create/_component/invoice-info";
import { INVOICE_PREFIX } from "@/config/constant";
import { downloadFile } from "@/lib/utils";
import { DiscountType } from "@/types/tax.type";
import ItemModal from "../../../create/_component/item-modal";


export default function InvoiceTab() {
  const param = useParams();

  // STORE
  const isFirstLoadingDiscount = useRef(true);
  const isFirstLoadingClientDiscount = useRef(true);

  const companyId = useDataStore.use.currentCompany();

  const currency = useDataStore.use.currency();
  const { calculate } = useCalculateTaxe();

  const clientId = useClientIdStore.use.clientId();
  const setClientId = useClientIdStore.use.setClientId();

  const items = useItemStore.use.items();
  const updateDiscount = useItemStore.use.updateDiscount();
  const clearItem = useItemStore.use.clearItem();
  const setItems = useItemStore.use.setItems();

  const locationBillboardDate = useItemStore.use.locationBillboardDate();
  const setLocationBillboard = useItemStore.use.setLocationBillboard();


  const setProject = useProjectStore.use.setProject();
  const projects = useProjectStore.use.projects();

  const [paymentLimit, setPaymentLimit] = useState("");

  // STATE
  const [company, setCompany] = useState<CompanyType<string>>();
  const [clientDiscount, setClientDiscount] = useState<DiscountType>({ discount: 0, discountType: "purcent" });
  const [client, setClient] = useState<ClientType>();
  const [invoiceNumber, setInvoiceNumber] = useState(0);
  const [lastUploadFiles, setLastUploadFiles] = useState<string[]>([]);

  // FORM
  const form = useForm<InvoiceUpdateSchemaType>({
    resolver: zodResolver(invoiceUpdateSchema),
    defaultValues: {},
  });

  // INVOICE ACTION
  const { mutate: mutateGetInvoice, isPending: isGettingInvoice, data: invoiceData } = useQueryAction<
    { id: string },
    RequestResponse<InvoiceType>
  >(getUniqueInvoice, () => { }, "invoice");


  const { mutate: mutateUpdateInvoice, isPending: isUpdatingInvoice } = useQueryAction<
    InvoiceUpdateSchemaType,
    RequestResponse<InvoiceType>
  >(updateInvoice, () => { }, "invoice");


  const {
    mutate: mutateGetItemLocations,
    isPending: isGettingItemLOcations,
  } = useQueryAction<{ companyId: string }, RequestResponse<LocationBillboardDateType[]>>(
    getBillboardItemLocations,
    () => { },
    "item-locations"
  );


  // CLIENT ACTION
  const {
    mutate: mutateGetClients,
    isPending: isGettingClients,
    data: clientDatas,
  } = useQueryAction<{ id: string }, RequestResponse<ClientType[]>>(
    getClients,
    () => { },
    "clients"
  );

  const { mutate: mutateGetClient } = useQueryAction<
    { id: string },
    RequestResponse<ClientType>
  >(getClient, () => { }, "client");

  // DOCUMENT ACTION
  const {
    mutate: mutateGetDocument,
    isPending: isGettingDocument,
    data: documentData,
  } = useQueryAction<{ id: string }, RequestResponse<ModelDocumentType<File>>>(
    getDocument,
    () => { },
    "document"
  );

  // PROJECT ACTION
  const {
    mutate: mutateGetProject,
    isPending: isGettingProject,
  } = useQueryAction<{ clientId: string }, RequestResponse<ProjectType[]>>(
    allByClient,
    () => { },
    "projects"
  );

  useEffect(() => {
    clearItem();
  }, []);


  useEffect(() => {
    if (companyId) {
      mutateGetItemLocations({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setLocationBillboard(data.data);
          }
        },
      })
    }
  }, [companyId])


  useEffect(() => {
    if (param.id) {
      mutateGetInvoice({ id: param.id as string }, {
        onSuccess(data) {
          if (data.data) {
            const invoice = data.data;
            setCompany(invoice.company);
            setClientId(invoice.clientId);
            setInvoiceNumber(invoice.invoiceNumber);
            setPaymentLimit(invoice.paymentLimit);
            setLastUploadFiles(invoice.files.filter((file) => Boolean(file)) ?? []);
            setClientDiscount({
              discount: Number(invoice.discount),
              discountType: invoice.discountType as "purcent" | "money"
            });


            const mappedItems = [...invoice.items.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              itemType: item.itemType as "billboard" | "product" | "service",
              updatedPrice: item.updatedPrice,
              discountType: item.discountType as "purcent" | "money",
              discount: item.discount,
              description: item.description ?? "",
              currency: item.currency,
              lastUploadFiles: invoice.files.filter((file) => Boolean(file)) ?? [],
              ...item.itemType === "billboard" ? {
                billboardId: item.billboardId || undefined,
                locationStart: item.locationStart,
                locationEnd: item.locationEnd,
              } : { productServiceId: item.productServiceId || undefined, lastQuantity: item.quantity }
            }))]

            console.log({ mappedItems });

            form.reset({
              id: invoice.id,
              companyId: invoice.companyId,
              invoiceNumber: invoice.invoiceNumber,
              note: invoice.note,
              paymentLimit: invoice.paymentLimit,
              totalHT: invoice.totalHT,
              totalTTC: invoice.totalTTC,
              discount: invoice.discount,
              discountType: invoice.discountType as "purcent" | "money",
              payee: invoice.payee,
              clientId: invoice.clientId,
              projectId: invoice.projectId,
              item: {
                billboards: invoice.items.filter(item => item.itemType === "billboard").map(billboard => ({
                  id: billboard.id,
                  name: billboard.name,
                  quantity: billboard.quantity,
                  price: billboard.price,
                  itemType: 'billboard',
                  updatedPrice: billboard.updatedPrice,
                  locationStart: new Date(billboard.locationStart),
                  locationEnd: new Date(billboard.locationEnd),
                  discountType: billboard.discountType as "purcent" | "money",
                  discount: billboard.discount,
                  description: billboard.description ?? "",
                  billboardId: billboard.billboardId || undefined,
                  currency: billboard.currency,
                })),
                productServices: invoice.items.filter(item => item.itemType !== "billboard").map(productService => ({
                  id: productService.id,
                  name: productService.name,
                  quantity: productService.quantity,
                  price: productService.price,
                  itemType: productService.itemType as "product" | "service",
                  updatedPrice: productService.updatedPrice,
                  discountType: productService.discountType as "purcent" | "money",
                  discount: productService.discount,
                  description: productService.description ?? "",
                  productServiceId: productService.productServiceId || undefined,
                  currency: productService.currency,
                })),
              }
            });

            setItems(mappedItems)

            mutateGetClients({ id: invoice.companyId }, {
              onSuccess(data) {
                if (data.data && data.data.length > 0 && invoice.clientId) {
                  const clients = data.data;
                  setClient(clients.find((c) => c.id === invoice.clientId));
                }
              },
            });
            mutateGetProject({ clientId: invoice.clientId }, {
              onSuccess(data) {
                if (data.data) {
                  const project = data.data;
                  setProject(project);
                }
              },
            });
            mutateGetClient({ id: invoice.clientId })
            mutateGetDocument({ id: invoice.companyId })
          }
        },
      })
    }
  }, [param])


  useEffect(() => {
    if (clientId) {
      mutateGetProject({ clientId: clientId }, {
        onSuccess(data) {
          if (data.data) {
            const project = data.data;
            setProject(project);
          }
        },
      });
      mutateGetClient(
        { id: clientId },
        {
          onSuccess(data) {
            if (data.data) {
              if (isFirstLoadingDiscount.current) {
                isFirstLoadingDiscount.current = false;
                return;
              }
              updateDiscount(data.data.discount);
            }
          },
        }
      );
    }
  }, [clientId]);

  useEffect(() => {
    if (clientDatas?.data && clientId) {
      const clients = clientDatas.data;
      setClient(clients.find((c) => c.id === clientId));
    }
  }, [clientId, clientDatas]);


  useEffect(() => {
    if (items.length > 0) {
      form.setValue("item", {
        billboards: items
          .filter((item) => item.itemType === "billboard")
          .map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            status: item.status,
            itemType: item.itemType,
            updatedPrice: String(
              calculate({
                items: [item],
                taxes: company?.vatRates ?? [],
              }).totalWithoutTaxes
            ),
            locationStart: item.locationStart && new Date(item.locationStart),
            locationEnd: item.locationEnd && new Date(item.locationEnd),
            discountType: item.discountType,
            description: item.description,
            discount: item.discount,
            billboardId: item.billboardId,
            currency: item.currency,
          })),
        productServices: items
          .filter((item) => item.itemType !== "billboard")
          .map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            updatedPrice: String(
              calculate({
                items: [item],
                taxes: company?.vatRates ?? [],
              }).totalWithoutTaxes
            ),
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

  useEffect(() => {
    form.setValue("paymentLimit", paymentLimit);
  }, [paymentLimit])

  const totals = useMemo(() => {
    const HTPrice = calculate({
      items: items,
      taxes: company?.vatRates ?? [],
      discount: clientDiscount.discount && clientDiscount.discountType ? [clientDiscount.discount, clientDiscount.discountType] : undefined
    }).totalWithoutTaxes;

    const TTCPrice = calculate({
      items: items,
      taxes: company?.vatRates ?? [],
      discount: clientDiscount.discount && clientDiscount.discountType ? [clientDiscount.discount, clientDiscount.discountType] : undefined
    }).totalWithTaxes

    return { HTPrice, TTCPrice };
  }, [items, company?.vatRates, clientDiscount]);

  useEffect(() => {
    form.setValue("totalHT", String(totals.HTPrice));
    form.setValue("totalTTC", String(totals.TTCPrice));
    form.setValue("discount", String(clientDiscount.discount));
    form.setValue("discountType", clientDiscount.discountType);
  }, [totals, clientDiscount]);

  useEffect(() => {
    if (client) {
      if (isFirstLoadingClientDiscount.current) {
        isFirstLoadingClientDiscount.current = false;
        return
      }
      setClientDiscount({
        discount: client.discount.includes("%")
          ? Number(client.discount.split("%")[0])
          : Number(client.discount),
        discountType: "purcent",
      });
    }
  }, [client]);

  useEffect(() => {
    form.watch(() => {
      console.log({ errors: form.formState.errors })
    })
  }, [form.watch])

  function removeLastUpload(name: string, type: "file") {
    switch (type) {
      case "file":
        setLastUploadFiles((prev) => prev.filter((d) => d !== name));
        break;
    }
  }

  const submit = useCallback(
    async (invoiceData: InvoiceUpdateSchemaType) => {
      const { success, data } = invoiceUpdateSchema.safeParse(invoiceData);
      if (!success) return;
      mutateUpdateInvoice({ ...data, lastUploadFiles });
    },
    [mutateUpdateInvoice, form]
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
                      isLoading={isGettingClients}
                      datas={
                        clientDatas?.data?.map((client) => ({
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
          <div className="space-y-2">
            <h2 className="font-semibold">
              Article{items.length > 1 && "s"} ({items.length})
            </h2>
            <div className="space-y-2">
              {items.map((item) => (
                <ItemList key={item.id} item={item} locationBillboardDate={locationBillboardDate} calculate={calculate} taxes={company?.vatRates ?? []} />
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
            <div className="gap-x-2">
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
                        label="Photo(s)"
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
            <div className="gap-x-2">
              <FormField
                control={form.control}
                name="lastUploadFiles"
                render={() => (
                  <FormItem className="-space-y-0.5">
                    <FormLabel>Liste des fichiers enregistrés</FormLabel>
                    <FormControl>
                      <ScrollArea className="bg-gray p-4 border rounded-md h-[100px]">
                        <ul className="w-full text-sm">
                          {lastUploadFiles.length > 0 ? (
                            lastUploadFiles.map((file, index) => {
                              return (
                                <li
                                  key={index}
                                  className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
                                >
                                  {index + 1}. fichier.{file.split(".").pop()}{" "}
                                  <span className="flex items-center gap-x-2">
                                    <span
                                      onClick={() => downloadFile(file)}
                                      className="text-blue cursor-pointer"
                                    >
                                      <DownloadIcon className="w-4 h-4" />
                                    </span>{" "}
                                    <span
                                      onClick={() =>
                                        removeLastUpload(file, "file")
                                      }
                                      className="text-red cursor-pointer"
                                    >
                                      <XIcon className="w-4 h-4" />
                                    </span>{" "}
                                  </span>
                                </li>
                              );
                            })
                          ) : (
                            <li className="text-sm">Aucun document trouvé.</li>
                          )}
                        </ul>
                      </ScrollArea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                      isLoading={isGettingProject}
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
                        disabled: status !== "BLOCKED",
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
          <InvoiceInfo isGettingDocument={isGettingDocument} isGettingInvoiceNumber={isGettingInvoice}
            reference={`${documentData?.data?.invoicesPrefix || INVOICE_PREFIX}-${invoiceNumber}`}
            discount={clientDiscount}
            setDiscount={setClientDiscount}
            currency={currency}
            calculate={calculate}
            taxes={company?.vatRates ?? []}
            items={items}
            paymentLimit={paymentLimit}
            setPaymentLimit={setPaymentLimit}
            TTCPrice={totals.TTCPrice}
          />

          <div className="flex justify-center pt-2">
            <Button type="submit" variant="primary" className="justify-center">
              {isUpdatingInvoice ? <Spinner /> : "Valider"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
