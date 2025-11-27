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
import { cn, downloadFile, generateAmaId, parseItem, parseItems } from "@/lib/utils";
import { DiscountType } from "@/types/tax.type";
import ItemModal from "../../../create/_component/item-modal";
import { getAllProductServices } from "@/action/product-service.action";
import { ProductServiceType } from "@/types/product-service.types";
import Decimal from "decimal.js";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useRecordIdStore from "@/stores/record-id.store";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";


export default function InvoiceTab() {
  const param = useParams();

  const [amountType, setAmountType] = useState<"HT" | "TTC">("TTC");

  const isFirstLoadingDiscount = useRef(true);
  const isFirstLoadingClientDiscount = useRef(true);

  const companyId = useDataStore.use.currentCompany();

  const currency = useDataStore.use.currency();
  const { calculate } = useCalculateTaxe();

  const clientId = useClientIdStore.use.clientId();
  const setClientId = useClientIdStore.use.setClientId();

  const items = useItemStore.use.items();
  // const updateDiscount = useItemStore.use.updateDiscount();
  const clearItem = useItemStore.use.clearItem();
  const setItems = useItemStore.use.setItems();
  const setItemQuantities = useItemStore.use.setItemQuantity();

  const locationBillboardDate = useItemStore.use.locationBillboardDate();
  const setLocationBillboard = useItemStore.use.setLocationBillboard();


  const setProject = useProjectStore.use.setProject();
  const projects = useProjectStore.use.projects();

  const [paymentLimit, setPaymentLimit] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [amountPaid, setAmountPaid] = useState<Decimal>(new Decimal(0));
  const [amountDue, setAmountDue] = useState<Decimal>(new Decimal(0));
  const [payee, setPayee] = useState<Decimal>(new Decimal(0));

  const [company, setCompany] = useState<CompanyType>();
  const [clientDiscount, setClientDiscount] = useState<DiscountType>({ discount: 0, discountType: "purcent" });
  const [client, setClient] = useState<ClientType>();
  const [invoiceNumber, setInvoiceNumber] = useState(0);
  const [lastUploadFiles, setLastUploadFiles] = useState<string[]>([]);
  const setRecordId = useRecordIdStore.use.setRecordId();


  const readAccess = useAccess("INVOICES", "READ");
  const modifyAccess = useAccess("INVOICES", "MODIFY");


  const form = useForm<InvoiceUpdateSchemaType>({
    resolver: zodResolver(invoiceUpdateSchema),
    defaultValues: {
      amountType: "TTC"
    },
  });

  const { mutate: mutateGetInvoice, isPending: isGettingInvoice } = useQueryAction<
    { id: string },
    RequestResponse<InvoiceType>
  >(getUniqueInvoice, () => { }, "invoice");


  const { mutate: mutateUpdateInvoice, isPending: isUpdatingInvoice } = useQueryAction<
    InvoiceUpdateSchemaType,
    RequestResponse<InvoiceType>
  >(updateInvoice, () => { }, "invoice");


  const {
    mutate: mutateGetItemLocations,
  } = useQueryAction<{ companyId: string }, RequestResponse<LocationBillboardDateType[]>>(
    getBillboardItemLocations,
    () => { },
    "item-locations"
  );


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
    mutate: mutateGetProject,
    isPending: isGettingProject,
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
      })
      mutateGetItemLocations({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setLocationBillboard(data.data);
          }
        },
      })
    }
  }, [companyId, readAccess])


  useEffect(() => {
    if (param.id && readAccess) {
      initInvoice()
    }
  }, [param && readAccess])


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
              // updateDiscount(data.data.discount);
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
            quantity: item.quantity,
            hasTax: item.hasTax,
            price: item.price,
            status: item.status,
            itemType: item.itemType,
            updatedPrice: calculate({
              items: [parseItem(item)],
              taxes: company?.vatRates ?? [],
              amountType: amountType,
            }).totalWithoutTaxes
            ,
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
            reference: item.reference,
            id: item.id,
            name: item.name,
            hasTax: item.hasTax,
            quantity: item.quantity,
            price: item.price,
            updatedPrice:
              calculate({
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
      discount: [clientDiscount.discount || 0, clientDiscount.discountType]
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


  function initInvoice() {
    mutateGetInvoice({ id: param.id as string }, {
      onSuccess(data) {
        if (data.data) {
          const invoice = data.data;
          setAmountDue(
            invoice.amountType === "TTC" ? new Decimal(invoice.totalTTC).minus(invoice.payee) : new Decimal(invoice.totalHT).minus(invoice.payee)
          )
          setPayee(invoice.payee);
          setRecordId(invoice.id);
          setCompany(invoice.company);
          setClientId(invoice.clientId);
          setInvoiceNumber(invoice.invoiceNumber);
          setPaymentLimit(invoice.paymentLimit);
          setLastUploadFiles(invoice.files.filter((file) => Boolean(file)) ?? []);
          setAmountType(invoice.amountType);
          setClientDiscount({
            discount: Number(invoice.discount),
            discountType: invoice.discountType as "purcent" | "money"
          });

          setAmountPaid(new Decimal(invoice.payee))
          setIsPaid(invoice.isPaid);

          const mappedItems = [...invoice.items.map(item => ({
            id: item.id,
            reference: item.reference,
            name: item.name,
            hasTax: item.hasTax,
            quantity: item.quantity,
            price: new Decimal(item.price),
            itemType: item.itemType as "billboard" | "product" | "service",
            updatedPrice: new Decimal(item.updatedPrice),
            discountType: item.discountType as "purcent" | "money",
            discount: item.discount,
            description: item.description ?? "",
            currency: item.currency,
            locationStart: new Date(item.locationStart),
            locationEnd: new Date(item.locationEnd),
            lastUploadFiles: invoice.files.filter((file) => Boolean(file)) ?? [],
            ...item.itemType === "billboard" ? {
              billboardId: item.billboardId || undefined,
            } : { productServiceId: item.productServiceId || undefined, lastQuantity: item.quantity }
          }))];

          form.reset({
            id: invoice.id,
            companyId: invoice.companyId,
            invoiceNumber: invoice.invoiceNumber,
            note: invoice.note,
            paymentLimit: invoice.paymentLimit,
            totalHT: invoice.totalHT,
            totalTTC: invoice.totalTTC,
            discount: invoice.discount,
            amountType: invoice.amountType,
            discountType: invoice.discountType as "purcent" | "money",
            payee: new Decimal(invoice.payee),
            clientId: invoice.clientId,
            projectId: invoice.projectId,
            item: {
              billboards: invoice.items.filter(item => item.itemType === "billboard").map(billboard => ({
                id: billboard.id,
                reference: billboard.reference,
                name: billboard.name,
                hasTax: billboard.hasTax,
                quantity: billboard.quantity,
                price: billboard.price.toString(),
                itemType: 'billboard',
                updatedPrice: billboard.updatedPrice.toString(),
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
                reference: productService.reference,
                name: productService.name,
                hasTax: productService.hasTax,
                quantity: productService.quantity,
                lastQuantity: productService.quantity,
                price: productService.price.toString(),
                updatedPrice: productService.updatedPrice.toString(),
                locationStart: new Date(productService.locationStart),
                locationEnd: new Date(productService.locationEnd),
                itemType: productService.itemType as "product" | "service",
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

  function removeLastUpload(name: string) {
    setLastUploadFiles((prev) => prev.filter((d) => d !== name));
  }

  const submit = useCallback(
    async (invoiceData: InvoiceUpdateSchemaType) => {
      const { success, data } = invoiceUpdateSchema.safeParse(invoiceData);
      if (!success) return;
      mutateUpdateInvoice({ ...data, lastUploadFiles }, {
        onSuccess() {
          if (param.id) {
            initInvoice()
          }
        },
      });
    },
    [mutateUpdateInvoice, form, lastUploadFiles]
  );


  return (
    <AccessContainer hasAccess={readAccess} resource="INVOICES">
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
                        disabled={(amountPaid.gt(0) && isPaid) || !modifyAccess}
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
                          <Switch disabled={amountPaid.gt(0) || !modifyAccess} checked={field.value === "TTC"} onCheckedChange={e => {
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
            </div>
            <div className="space-y-2">
              <h2 className="font-semibold">
                Article{items.length > 1 && "s"} ({items.length})
              </h2>
              <div className="space-y-2">
                {items.map((item) => (
                  <ItemList key={item.id} item={item} locationBillboardDate={locationBillboardDate} calculate={calculate} taxes={company?.vatRates ?? []} amountPaid={amountPaid} amountType={amountType} disabled={!modifyAccess} />
                ))}
              </div>
              {amountPaid.eq(0) || modifyAccess &&
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
                          disabled={(amountPaid.gt(0) && isPaid) || !modifyAccess}
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
                                      {!isPaid && modifyAccess &&
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
              <h2 className="font-semibold">Projet</h2>
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        isLoading={isGettingProject}
                        disabled={(amountPaid.gt(0) && isPaid) || !modifyAccess}
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
                        disabled={(amountPaid.gt(0) && isPaid) || !modifyAccess}
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
              reference={`${documentData?.data?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(invoiceNumber, false)}`}
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
              isPaid={isPaid}
              amountPaid={amountPaid}
              amountType={amountType}
              payee={payee}
              amountDue={amountDue}
              disabled={!modifyAccess}
            />

            {modifyAccess &&
              <div className="flex justify-center pt-2">
                <Button type="submit" disabled={isPaid} variant="primary" className="justify-center">
                  {isUpdatingInvoice ? <Spinner /> : "Valider"}
                </Button>
              </div>
            }
          </div>
        </form>
      </Form>
    </AccessContainer>
  );
}
