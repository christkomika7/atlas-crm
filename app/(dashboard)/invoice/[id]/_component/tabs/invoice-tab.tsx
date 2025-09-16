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
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ProjectType } from "@/types/project.types";
import useItemStore from "@/stores/item.store";
import useProjectStore from "@/stores/project.store";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import useClientIdStore from "@/stores/client-id.store";
import {
  calculatePrice,
  calculateTaxes,
  calculateTaxesTotal,
  downloadFile,
  formatNumber,
} from "@/lib/utils";

import { ModelDocumentType } from "@/types/document.types";
import { paymentTerms } from "@/lib/data";
import { useParams } from "next/navigation";
import { InvoiceType } from "@/types/invoice.types";
import { CompanyType } from "@/types/company.types";
import { addDays, formatDateToDashModel } from "@/lib/date";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";

import { all as getClients, unique as getClient } from "@/action/client.action";
import { allByClient } from "@/action/project.action";
import { unique as getUniqueInvoice, update as updateInvoice } from "@/action/invoice.action";
import { unique as getDocument } from "@/action/document.action";
import ItemModal from "../../../create/_component/item-modal";
import ProjectModal from "../../../_component/project-modal";
import { DownloadIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function InvoiceTab() {
  const param = useParams();

  // STORE
  const currency = useDataStore.use.currency();

  const clientId = useClientIdStore.use.clientId();
  const setClientId = useClientIdStore.use.setClientId();

  const items = useItemStore.use.items();
  const updateItem = useItemStore.use.updateItem();
  const updateDiscount = useItemStore.use.updateDiscount();
  const removeItem = useItemStore.use.removeItem();
  const clearItem = useItemStore.use.clearItem();
  const editItemField = useItemStore.use.editItemField();
  const setItems = useItemStore.use.setItems()
  const locationBillboardDate = useItemStore.use.locationBillboardDate();

  const setProject = useProjectStore.use.setProject();
  const projects = useProjectStore.use.projects();

  // STATE
  const [company, setCompany] = useState<CompanyType<string>>();
  const [clientDiscount, setClientDiscount] = useState<{
    discount: number;
    discountType: "purcent" | "money";
  }>({ discount: 0, discountType: "purcent" });
  const [client, setClient] = useState<ClientType>();
  const [invoiceNumber, setInvoiceNumber] = useState(0);
  const [lastUploadFiles, setLastUploadFiles] = useState<string[]>([]);
  const [lastUploadPhotos, setLastUploadPhotos] = useState<string[]>([]);



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
    data: projectDatas,
  } = useQueryAction<{ clientId: string }, RequestResponse<ProjectType[]>>(
    allByClient,
    () => { },
    "projects"
  );

  useEffect(() => {
    clearItem();
  }, []);


  useEffect(() => {
    if (param.id) {
      mutateGetInvoice({ id: param.id as string }, {
        onSuccess(data) {
          if (data.data) {
            const invoice = data.data;
            console.log({ invoice });

            setCompany(invoice.company);
            setClientId(invoice.clientId);
            setInvoiceNumber(invoice.invoiceNumber);
            setLastUploadFiles(invoice.files.filter((file) => Boolean(file)) ?? []);
            setLastUploadPhotos(
              invoice.photos.filter((photo) => Boolean(photo)) ?? []
            );

            const mappedItems = [...invoice.items.map(item => ({
              id: item.itemType === 'billboard' ? item.billboardId as string : item.productServiceId as string,
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
              lastUploadPhotos:
                invoice.photos.filter((photo) => Boolean(photo)) ?? [],
              ...item.itemType === "billboard" ? {
                billboardId: item.billboardId as string,
                locationStart: item.locationStart,
                locationEnd: item.locationEnd,
              } : { productServiceId: item.productServiceId as string, lastQuantity: item.quantity }
            }))]

            form.reset({
              companyId: invoice.companyId,
              invoiceNumber: invoice.invoiceNumber,
              note: invoice.note,
              totalHT: invoice.totalHT,
              totalTTC: invoice.totalTTC,
              discount: invoice.discount,
              discountType: invoice.discountType as "purcent" | "money",
              payee: invoice.payee,
              clientId: invoice.clientId,
              projectId: invoice.projectId,
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
            mutateGetClient({ id: invoice.clientId }, {
              onSuccess(data) {
                if (data.data) {
                  const client = data.data;
                  updateDiscount(client.discount)
                }
              },
            })
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
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            status: item.status,
            itemType: item.itemType,
            updatedPrice: String(
              calculateTaxes({
                items: [
                  {
                    name: item.name,
                    price: calculatePrice(
                      parseFloat(item.price),
                      parseInt(String(item.discount).replace("%", "")),
                      item.discountType
                    ),
                    quantity: item.quantity,
                  },
                ],
                itemType: "article",
                taxes: company?.vatRates ?? [],
                taxOperation: "sequence",
              }).totalWithoutTaxes
            ),
            locationStart: item.locationStart,
            locationEnd: item.locationEnd,
            discountType: item.discountType,
            description: item.description,
            discount: String(item.discount),
            billboardId: item.id,
            currency: item.currency,
          })),
        productServices: items
          .filter((item) => item.itemType !== "billboard")
          .map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            updatedPrice: String(
              calculateTaxes({
                items: [
                  {
                    name: item.name,
                    price: calculatePrice(
                      parseFloat(item.price),
                      parseInt(String(item.discount).replace("%", "")),
                      item.discountType
                    ),
                    quantity: 1,
                  },
                ],
                itemType: "article",
                taxes: company?.vatRates ?? [],
                taxOperation: "sequence",
              }).totalWithoutTaxes
            ),
            itemType: item.itemType,
            discountType: item.discountType,
            description: item.description,
            discount: String(item.discount),
            productServiceId: item.id,
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
    const HTPrice = calculateTaxes({
      items: items.map((item) => ({
        name: item.name,
        price: calculatePrice(
          parseFloat(item.price),
          parseInt(String(item.discount).replace("%", "")),
          item.discountType
        ),
        quantity: item.quantity,
      })),
      itemType: "article",
      taxes: company?.vatRates ?? [],
      taxOperation: "sequence",
    }).totalWithoutTaxes;

    const TTCPrice = calculateTaxesTotal({
      totalPrice: calculatePrice(
        HTPrice,
        parseFloat(String(clientDiscount.discount).replace("%", "")),
        clientDiscount.discountType
      ),
      taxes: company?.vatRates ?? [],
      taxOperation: "sequence",
    }).totalWithTaxes;

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
      setClientDiscount({
        discount: client.discount.includes("%")
          ? Number(client.discount.split("%")[0])
          : Number(client.discount),
        discountType: "purcent",
      });
    }
  }, [client]);

  // useEffect(() => {
  //   form.watch(() => {
  //     console.log({ errors: form.formState.errors });
  //   })

  // }, [form.watch])

  function removeLastUpload(name: string, type: "file" | "photo") {
    switch (type) {
      case "file":
        setLastUploadFiles((prev) => prev.filter((d) => d !== name));
        break;
      case "photo":
        setLastUploadPhotos((prev) => prev.filter((d) => d !== name));
        break;
    }
  }

  const submit = useCallback(
    async (invoiceData: InvoiceUpdateSchemaType) => {
      const { success, data } = invoiceUpdateSchema.safeParse(invoiceData);
      if (!success) return;
      mutateUpdateInvoice({ ...data, lastUploadFiles, lastUploadPhotos }, {
        onSuccess() {
          form.reset();
        },
      });
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
                          label: `${client.firstname} ${client.lastname}`,
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
                <div
                  className="group relative flex flex-col hover:bg-blue/5 p-1.5 border-blue border-l-4 w-full"
                  key={item.id}
                >
                  <span
                    className="top-0 right-1 absolute opacity-0 group-hover:opacity-100 font-bold text-red-500 text-sm transition-opacity cursor-pointer"
                    onClick={() => removeItem(item.id)}
                  >
                    ×
                  </span>

                  <h2 className="font-semibold text-sm">{item.name}</h2>
                  {item.description && (
                    <p className="mb-2 text-sm">{item.description}</p>
                  )}
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex items-center gap-x-1 font-medium text-sm">
                      <span>
                        <TextInput
                          type="number"
                          max={item.maxQuantity ?? 0}
                          value={item.quantity}
                          handleChange={(e) => {
                            if (
                              item.maxQuantity &&
                              Number(e) > item.maxQuantity
                            ) {
                              editItemField(
                                item.id,
                                "quantity",
                                Number(item.maxQuantity)
                              );
                              return toast.error(
                                "La quantité max valable est " +
                                item.maxQuantity
                              );
                            }
                            editItemField(item.id, "quantity", Number(e));
                          }}
                          className="w-20 h-8"
                        />
                      </span>
                      x
                      <span>
                        {formatNumber(item.price)} {item.currency}
                      </span>
                    </div>

                    <div className="flex items-center gap-x-2 max-w-[150px]">
                      <TextInput
                        type="number"
                        value={
                          item.discount != null
                            ? String(item.discount).includes("%")
                              ? String(item.discount).split("%")[0]
                              : String(item.discount)
                            : "0"
                        }
                        className="!rounded-lg h-8"
                        handleChange={(e) =>
                          updateItem({ ...item, discount: e as string })
                        }
                      />

                      <ToggleGroup
                        type="single"
                        value={item.discountType}
                        onValueChange={(e) => {
                          updateItem({
                            ...item,
                            discountType: e as "purcent" | "money",
                          });
                        }}
                      >
                        <ToggleGroupItem value="purcent">%</ToggleGroupItem>
                        <ToggleGroupItem value="money">$</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </div>
                  {item.itemType === "billboard" && (
                    <div className="flex mt-3 mb-2">
                      <DatePicker
                        className="flex w-[300px]"
                        label="Durée de la location"
                        mode="range"
                        disabledRanges={
                          locationBillboardDate
                            .find((b) => b.id === item.id)
                            ?.locationDate.map((d) => [
                              new Date(d.start),
                              new Date(d.end),
                            ]) ?? []
                        }
                        value={
                          item.locationStart && item.locationEnd
                            ? {
                              from: new Date(item.locationStart),
                              to: new Date(item.locationEnd),
                            }
                            : undefined
                        }
                        onChange={(e) => {
                          const range = e as
                            | { from: Date; to: Date }
                            | undefined;
                          if (range) {
                            editItemField(item.id, "locationStart", range.from);
                            editItemField(item.id, "locationEnd", range.to);
                            return;
                          }
                          editItemField(item.id, "locationStart", undefined);
                          editItemField(item.id, "locationEnd", undefined);
                        }}
                      />
                    </div>
                  )}
                  <ul>
                    {calculateTaxes({
                      items: [
                        {
                          name: item.name,
                          price: calculatePrice(
                            parseFloat(item.price),
                            parseFloat(String(item.discount).replace("%", "")),
                            item.discountType
                          ),
                          quantity: item.quantity,
                        },
                      ],
                      itemType: "article",
                      taxes: company?.vatRates ?? [],
                      taxOperation: "sequence",
                    }).taxes.map((tax) => (
                      <li key={tax.taxName} className="text-xs">
                        <span className="font-semibold">{tax.taxName}: </span>
                        {formatNumber(tax.totalTax)} {item.currency}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs">
                    <span className="font-semibold">Taxes totales: </span>
                    {formatNumber(
                      calculateTaxes({
                        items: [
                          {
                            name: item.name,
                            price: calculatePrice(
                              parseFloat(item.price),
                              parseFloat(
                                String(item.discount).replace("%", "")
                              ),
                              item.discountType
                            ),
                            quantity: item.quantity,
                          },
                        ],
                        itemType: "article",
                        taxes: company?.vatRates ?? [],
                        taxOperation: "sequence",
                      }).totalTax
                    )}{" "}
                    {item.currency}
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold">Total HT: </span>
                    {formatNumber(
                      calculateTaxes({
                        items: [
                          {
                            name: item.name,
                            price: calculatePrice(
                              parseFloat(item.price),
                              parseFloat(
                                String(item.discount).replace("%", "")
                              ),
                              item.discountType
                            ),
                            quantity: item.quantity,
                          },
                        ],
                        itemType: "article",
                        taxes: company?.vatRates ?? [],
                        taxOperation: "sequence",
                      }).totalWithoutTaxes
                    )}{" "}
                    {item.currency}
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold">Total TTC: </span>
                    {formatNumber(
                      calculateTaxes({
                        items: [
                          {
                            name: item.name,
                            price: calculatePrice(
                              parseFloat(item.price),
                              parseFloat(
                                String(item.discount).replace("%", "")
                              ),
                              item.discountType
                            ),
                            quantity: item.quantity,
                          },
                        ],
                        itemType: "article",
                        taxes: company?.vatRates ?? [],
                        taxOperation: "sequence",
                      }).totalWithTaxes
                    )}{" "}
                    {item.currency}
                  </p>
                </div>
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
            <div className="gap-x-2 grid grid-cols-2">
              <FormField
                control={form.control}
                name="photos"
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
                        handleChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          console.log({ e });
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="gap-x-2 grid grid-cols-2">
              <FormField
                control={form.control}
                name="lastUploadPhotos"
                render={() => (
                  <FormItem className="-space-y-0.5">
                    <FormLabel>Liste des photos enregistrées</FormLabel>
                    <FormControl>
                      <ScrollArea className="bg-gray p-4 border rounded-md h-[100px]">
                        <ul className="w-full text-sm">
                          {lastUploadPhotos.length > 0 ? (
                            lastUploadPhotos.map((photo, index) => {
                              return (
                                <li
                                  key={index}
                                  className="flex justify-between items-center hover:bg-white/50 p-2 rounded"
                                >
                                  {index + 1}. photo.{photo.split(".").pop()}{" "}
                                  <span className="flex items-center gap-x-2">
                                    <span
                                      onClick={() => downloadFile(photo)}
                                      className="text-blue cursor-pointer"
                                    >
                                      <DownloadIcon className="w-4 h-4" />
                                    </span>{" "}
                                    <span
                                      onClick={() =>
                                        removeLastUpload(photo, "photo")
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
          <div className="space-y-2">
            <div className="flex justify-between gap-x-2">
              <h2 className="font-semibold">Facture</h2>
              {isGettingDocument ? (
                <Spinner size={10} />
              ) : (
                <p className="font-medium text-sm">
                  N°: {documentData?.data?.invoicesPrefix}-
                  {invoiceNumber}
                </p>
              )}
            </div>
            <Badge variant="secondary" className="px-3 py-2">
              Non envoyé
            </Badge>
          </div>

          <div className="space-y-2 pb-4 border-neutral-200 border-b">
            <div className="flex justify-between text-sm">
              <h2 className="font-semibold">Date</h2>
              <p>{formatDateToDashModel(new Date())}</p>
            </div>
            <div className="flex justify-between text-sm">
              <h2>Condition</h2>
              <p>
                {client
                  ? paymentTerms.find((p) => p.value === client.paymentTerms)
                    ?.label
                  : "----"}
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <h2>Date d’échéance</h2>
              <p>
                {client?.paymentTerms
                  ? addDays(
                    new Date(),
                    paymentTerms.find((p) => p.value === client.paymentTerms)
                      ?.data ?? 0
                  ) as string
                  : "----"}
              </p>
            </div>
          </div>
          <div className="space-y-2 pb-4 border-neutral-200 border-b">
            <div className="flex justify-between text-sm">
              <h2>Total HT</h2>

              <p>
                {items.length > 0 ? (
                  <>
                    {formatNumber(
                      calculatePrice(
                        totals.HTPrice,
                        parseFloat(
                          String(clientDiscount.discount).replace("%", "")
                        ),
                        clientDiscount.discountType
                      )
                    )}
                  </>
                ) : (
                  0
                )}{" "}
                {currency}
              </p>
            </div>
            <ul>
              {calculateTaxes({
                items: items.map((item) => ({
                  name: item.name,
                  price: calculatePrice(
                    parseFloat(item.price),
                    parseFloat(String(item.discount).replace("%", "")),
                    item.discountType
                  ),
                  quantity: item.quantity,
                })),
                itemType: "total",
                taxes: company?.vatRates ?? [],
                taxOperation: "sequence",
              }).taxes.map((tax) => (
                <li key={tax.taxName} className="flex justify-between text-sm">
                  <span>{tax.taxName} </span>
                  {formatNumber(tax.totalTax)} {company?.currency}
                </li>
              ))}
            </ul>
            <div className="flex justify-between text-sm">
              <h2>Réduction</h2>
              <div className="flex items-center gap-x-2 max-w-[150px]">
                <TextInput
                  type="number"
                  value={
                    clientDiscount?.discount != null
                      ? String(clientDiscount.discount).includes("%")
                        ? Number(String(clientDiscount.discount).split("%")[0])
                        : Number(clientDiscount.discount)
                      : 0
                  }
                  className="!rounded-lg h-8"
                  handleChange={(e) =>
                    setClientDiscount({
                      ...clientDiscount,
                      discount: Number(e),
                    })
                  }
                />

                <ToggleGroup
                  type="single"
                  value={clientDiscount.discountType}
                  onValueChange={(e) =>
                    setClientDiscount({
                      ...clientDiscount,
                      discountType: e as "purcent" | "money",
                    })
                  }
                >
                  <ToggleGroupItem value="purcent">%</ToggleGroupItem>
                  <ToggleGroupItem value="money">$</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>

          <div className="space-y-2 pb-4 border-neutral-200 border-b">
            <div className="flex justify-between text-sm">
              <h2 className="font-semibold">Total TTC</h2>
              <p>
                {items.length > 0 ? <>{totals.TTCPrice}</> : 0} {currency}
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <h2>Avance</h2>
              <p>0 {currency}</p>
            </div>
            <div className="flex justify-between text-sm">
              <h2>Payer</h2>
              <p>0 {currency}</p>
            </div>
          </div>

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
