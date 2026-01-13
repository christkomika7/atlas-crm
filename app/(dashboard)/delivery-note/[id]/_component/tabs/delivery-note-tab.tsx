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
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import useItemStore, { LocationBillboardDateType } from "@/stores/item.store";
import useClientIdStore from "@/stores/client-id.store";


import { ModelDocumentType } from "@/types/document.types";
import { useParams } from "next/navigation";
import { CompanyType } from "@/types/company.types";

import { all as getClients, unique as getClient } from "@/action/client.action";
import { unique as getDocument } from "@/action/document.action";
import { DownloadIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import ItemList from "../../../create/_component/item-list";
import { cn, downloadFile, generateAmaId, parseItem, parseItems } from "@/lib/utils";
import { DiscountType } from "@/types/tax.type";
import ItemModal from "../../../create/_component/item-modal";
import { getAllProductServices } from "@/action/product-service.action";
import { ProductServiceType } from "@/types/product-service.types";
import Decimal from "decimal.js";
import { deliveryNoteUpdateSchema, DeliveryNoteUpdateSchemaType } from "@/lib/zod/delivery-note.schema";
import { DeliveryNoteType } from "@/types/delivery-note.types";
import { getUniqueDeliveryNote, updateDeliveryNote } from "@/action/delivery-note.action";
import DeliveryNoteInfo from "../../../create/_component/delivery-note-info";
import { DELIVERY_NOTE_PREFIX } from "@/config/constant";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getBillboardItemLocations } from "@/action/delivery-note.action";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";


export default function DeliveryNoteTab() {
  const param = useParams();

  const isFirstLoadingDiscount = useRef(true);
  const isFirstLoadingClientDiscount = useRef(true);

  const companyId = useDataStore.use.currentCompany();

  const currency = useDataStore.use.currency();
  const { calculate } = useCalculateTaxe();

  const clientId = useClientIdStore.use.clientId();
  const setClientId = useClientIdStore.use.setClientId();

  const items = useItemStore.use.items();
  const clearItem = useItemStore.use.clearItem();
  const setItems = useItemStore.use.setItems();
  const setItemQuantities = useItemStore.use.setItemQuantity();

  const locationBillboardDate = useItemStore.use.locationBillboardDate();
  const setLocationBillboard = useItemStore.use.setLocationBillboard();



  const [paymentLimit, setPaymentLimit] = useState("");

  const [amountType, setAmountType] = useState<"HT" | "TTC">("TTC");
  const [company, setCompany] = useState<CompanyType>();
  const [clientDiscount, setClientDiscount] = useState<DiscountType>({ discount: 0, discountType: "purcent" });
  const [client, setClient] = useState<ClientType>();
  const [deliveryNoteNumber, setDeliverNoteNumber] = useState(0);
  const [lastUploadFiles, setLastUploadFiles] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const { access: readAccess, loading } = useAccess("DELIVERY_NOTES", "READ");
  const { access: modifyAccess } = useAccess("DELIVERY_NOTES", "MODIFY");

  const form = useForm<DeliveryNoteUpdateSchemaType>({
    resolver: zodResolver(deliveryNoteUpdateSchema),
    defaultValues: {
      amountType: "TTC"
    },
  });

  const { mutate: mutateGetDeliveryNote, isPending: isGettingDeliveryNote } = useQueryAction<
    { id: string },
    RequestResponse<DeliveryNoteType>
  >(getUniqueDeliveryNote, () => { }, "delivery-note");


  const { mutate: mutateUpdateDeliveryNote, isPending: isUpdatinDelivertNote } = useQueryAction<
    DeliveryNoteUpdateSchemaType,
    RequestResponse<DeliveryNoteType>
  >(updateDeliveryNote, () => { }, "delivery-note");


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

  const {
    mutate: mutateGetDocument,
    isPending: isGettingDocument,
    data: documentData,
  } = useQueryAction<{ id: string }, RequestResponse<ModelDocumentType>>(
    getDocument,
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


  const { mutate: mutateGetProductService } = useQueryAction<
    { companyId: string; },
    RequestResponse<ProductServiceType[]>
  >(getAllProductServices, () => { }, "product-services");


  useEffect(() => {
    clearItem();
  }, []);


  useEffect(() => {
    if (companyId && readAccess) {
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

      mutateGetItemLocations({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setLocationBillboard(data.data);
          }
        },
      });
    }
  }, [companyId, readAccess])


  useEffect(() => {
    if (param.id && readAccess) {
      mutateGetDeliveryNote({ id: param.id as string }, {
        onSuccess(data) {
          if (data.data) {
            const deliveryNote = data.data;
            setCompany(deliveryNote.company);
            setClientId(deliveryNote.clientId);
            setDeliverNoteNumber(deliveryNote.deliveryNoteNumber);
            setPaymentLimit(deliveryNote.paymentLimit);
            setLastUploadFiles(deliveryNote.files.filter((file) => Boolean(file)) ?? []);
            setAmountType(deliveryNote.amountType);
            setClientDiscount({
              discount: Number(deliveryNote.discount),
              discountType: deliveryNote.discountType as "purcent" | "money"
            });
            setIsCompleted(deliveryNote.isCompleted);

            const mappedItems = [...deliveryNote.items.map(item => ({
              id: item.id,
              reference: item.reference,
              name: item.name,
              hasTax: item.hasTax,
              quantity: item.quantity,
              price: item.price,
              itemType: item.itemType as "billboard" | "product" | "service",
              updatedPrice: item.updatedPrice,
              discountType: item.discountType as "purcent" | "money",
              discount: item.discount,
              description: item.description ?? "",
              currency: item.currency,
              locationStart: new Date(item.locationStart),
              locationEnd: new Date(item.locationEnd),
              lastUploadFiles: deliveryNote.files.filter((file) => Boolean(file)) ?? [],
              ...item.itemType === "billboard" ? {
                billboardId: item.billboardId || undefined,
              } : { productServiceId: item.productServiceId || undefined, lastQuantity: item.quantity }
            }))];

            form.reset({
              id: deliveryNote.id,
              companyId: deliveryNote.companyId,
              deliveryNoteNumber: deliveryNote.deliveryNoteNumber,
              note: deliveryNote.note,
              paymentLimit: deliveryNote.paymentLimit,
              amountType: deliveryNote.amountType,
              totalHT: deliveryNote.totalHT,
              totalTTC: deliveryNote.totalTTC,
              discount: deliveryNote.discount,
              discountType: deliveryNote.discountType as "purcent" | "money",
              clientId: deliveryNote.clientId,
              item: {
                billboards: deliveryNote.items.filter(item => item.itemType === "billboard").map(billboard => ({
                  id: billboard.id,
                  name: billboard.name,
                  hasTax: billboard.hasTax,
                  quantity: billboard.quantity,
                  price: new Decimal(billboard.price),
                  itemType: 'billboard',
                  updatedPrice: new Decimal(billboard.updatedPrice),
                  locationStart: new Date(billboard.locationStart),
                  locationEnd: new Date(billboard.locationEnd),
                  discountType: billboard.discountType as "purcent" | "money",
                  discount: billboard.discount,
                  description: billboard.description ?? "",
                  billboardId: billboard.billboardId || undefined,
                  currency: billboard.currency,
                })),
                productServices: deliveryNote.items.filter(item => item.itemType !== "billboard").map(productService => ({
                  id: productService.id,
                  name: productService.name,
                  hasTax: productService.hasTax,
                  quantity: productService.quantity,
                  lastQuantity: productService.quantity,
                  price: new Decimal(productService.price),
                  locationStart: new Date(productService.locationStart),
                  locationEnd: new Date(productService.locationEnd),
                  itemType: productService.itemType as "product" | "service",
                  updatedPrice: new Decimal(productService.updatedPrice),
                  discountType: productService.discountType as "purcent" | "money",
                  discount: productService.discount,
                  description: productService.description ?? "",
                  productServiceId: productService.productServiceId || undefined,
                  currency: productService.currency,
                })),
              },
              lastUploadFiles: [],
            });

            setItems(mappedItems)

            mutateGetClients({ id: deliveryNote.companyId }, {
              onSuccess(data) {
                if (data.data && data.data.length > 0 && deliveryNote.clientId) {
                  const clients = data.data;
                  setClient(clients.find((c) => c.id === deliveryNote.clientId));
                }
              },
            });

            mutateGetClient({ id: deliveryNote.clientId })
            mutateGetDocument({ id: deliveryNote.companyId })
          }
        },
      })
    }
  }, [param, readAccess])


  useEffect(() => {
    if (clientId) {
      mutateGetClient(
        { id: clientId },
        {
          onSuccess(data) {
            if (data.data) {
              if (isFirstLoadingDiscount.current) {
                isFirstLoadingDiscount.current = false;
                return;
              }
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
              amountType: amountType,
            }).totalWithoutTaxes,
            locationStart: new Date(item.locationStart),
            locationEnd: new Date(item.locationEnd),
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
            reference: item.reference,
            name: item.name,
            hasTax: item.hasTax,
            quantity: item.quantity,
            price: new Decimal(item.price),
            updatedPrice: calculate({
              items: [parseItem(item)],
              taxes: company?.vatRates ?? [],
              amountType: amountType,
            }).totalWithoutTaxes,
            locationStart: new Date(item.locationStart),
            locationEnd: new Date(item.locationEnd),
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
      items: parseItems(items),
      taxes: company?.vatRates ?? [],
      amountType: amountType,
    }).totalWithoutTaxes;

    const TTCPrice = calculate({
      items: parseItems(items),
      taxes: company?.vatRates ?? [],
      amountType: amountType,
      discount: clientDiscount.discount && clientDiscount.discountType ? [clientDiscount.discount, clientDiscount.discountType] : undefined
    }).totalWithTaxes;

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

  function removeLastUpload(name: string) {
    setLastUploadFiles((prev) => prev.filter((d) => d !== name));
  }

  const submit = useCallback(
    async (deliveryNoteData: DeliveryNoteUpdateSchemaType) => {
      const { success, data } = deliveryNoteUpdateSchema.safeParse(deliveryNoteData);
      if (!success) return;
      mutateUpdateDeliveryNote({ ...data, lastUploadFiles });
    },
    [mutateUpdateDeliveryNote, form, lastUploadFiles]
  );

  if (loading) return <Spinner />

  return (
    <AccessContainer hasAccess={readAccess} resource="DELIVERY_NOTES">
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
                        disabled={!(modifyAccess && !isCompleted)}
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
                        <Switch disabled={!(modifyAccess && !isCompleted)} checked={field.value === "TTC"} onCheckedChange={e => {
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
                  <ItemList key={item.id} item={item} calculate={calculate} taxes={company?.vatRates ?? []} isCompleted={isCompleted} amountType={amountType} disabled={!modifyAccess} />
                ))}
              </div>
              {!isCompleted && modifyAccess &&
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
              }
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
                          disabled={!(modifyAccess && !isCompleted)}
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
                                      {!isCompleted && modifyAccess &&

                                        <span
                                          onClick={() =>
                                            removeLastUpload(file)
                                          }
                                          className="text-red cursor-pointer"
                                        >
                                          <XIcon className="w-4 h-4" />
                                        </span>
                                      }
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
              <h2 className="font-semibold">Détails des paiements</h2>
              <FormField
                control={form.control}
                name="note"

                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <TextInput
                        disabled={!(modifyAccess && !isCompleted)}
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
            <DeliveryNoteInfo isGettingDocument={isGettingDocument} isGettingDeliveryNoteNumber={isGettingDeliveryNote}
              reference={`${documentData?.data?.deliveryNotesPrefix || DELIVERY_NOTE_PREFIX}-${generateAmaId(deliveryNoteNumber, false)}`}
              discount={clientDiscount}
              setDiscount={setClientDiscount}
              currency={currency}
              calculate={calculate}
              taxes={company?.vatRates ?? []}
              items={items}
              paymentLimit={paymentLimit}
              setPaymentLimit={setPaymentLimit}
              TTCPrice={totals.TTCPrice}
              isCompleted={isCompleted}
              HTPrice={totals.HTPrice}
              amountType={amountType}
              disabled={!modifyAccess}
            />
            {modifyAccess &&
              <div className="flex justify-center pt-2">
                <Button disabled={isCompleted || isUpdatinDelivertNote} type="submit" variant="primary" className="justify-center">
                  {isUpdatinDelivertNote ? <Spinner /> : "Valider"}
                </Button>
              </div>
            }
          </div>
        </form>
      </Form>
    </AccessContainer>
  );
}
