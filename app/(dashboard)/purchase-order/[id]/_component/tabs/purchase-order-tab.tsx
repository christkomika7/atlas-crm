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
import { useEffect, useState, useMemo, useCallback, useRef } from "react";

import { ModelDocumentType } from "@/types/document.types";
import { useParams } from "next/navigation";
import { CompanyType } from "@/types/company.types";

import { all as getSuppliers, unique as getSupplier } from "@/action/supplier.action";
import { unique as getDocument } from "@/action/document.action";
import { unique as getProject } from "@/action/project.action"
import { DownloadIcon, XIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import ItemList from "../../../create/_component/item-list";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { cn, downloadFile, generateAmaId, parsePurchaseItem, parsePurchaseItems } from "@/lib/utils";
import { DiscountType } from "@/types/tax.type";
import ItemModal from "../../../create/_component/item-modal";
import { getAllProductServices } from "@/action/product-service.action";
import { ProductServiceType } from "@/types/product-service.types";
import Decimal from "decimal.js";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import useSupplierIdStore from "@/stores/supplier-id.store";
import { purchaseOrderUpdateSchema, PurchaseOrderUpdateSchemaType } from "@/lib/zod/purchase-order.schema";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { unique, update } from "@/action/purchase-order.action";
import { SupplierType } from "@/types/supplier.types";
import PurchaseOrderInfo from "../../../create/_component/purchase-order-info";
import usePurchaseItemStore, { PurchaseItemType } from "@/stores/purchase-item.store";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import useProjectStore from "@/stores/project.store";
import { getallByCompany } from "@/action/project.action";
import { ProjectType } from "@/types/project.types";


export default function PurchaseOrderTab() {
  const param = useParams();

  const isFirstLoadingDiscount = useRef(true);
  const isFirstLoadingsupplierDiscount = useRef(true);

  const companyId = useDataStore.use.currentCompany();

  const currency = useDataStore.use.currency();
  const { calculate } = useCalculateTaxe();

  const supplierId = useSupplierIdStore.use.supplierId();
  const setSupplierId = useSupplierIdStore.use.setSupplierId();

  const items = usePurchaseItemStore.use.items();
  const clearItem = usePurchaseItemStore.use.clearItem();
  const setItems = usePurchaseItemStore.use.setItems();
  const setItemQuantities = usePurchaseItemStore.use.setItemQuantity();

  const [paymentLimit, setPaymentLimit] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [amountPaid, setAmountPaid] = useState<Decimal>(new Decimal(0));

  const [amountDue, setAmountDue] = useState<Decimal>(new Decimal(0));
  const [payee, setPayee] = useState<Decimal>(new Decimal(0));
  const [amountType, setAmountType] = useState<"HT" | "TTC">("TTC");
  const [company, setCompany] = useState<CompanyType>();
  const [supplierDiscount, setSupplierDiscount] = useState<DiscountType>({ discount: 0, discountType: "purcent" });
  const [supplier, setSupplier] = useState<SupplierType>();
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState(0);
  const [lastUploadFiles, setLastUploadFiles] = useState<string[]>([]);


  const setProject = useProjectStore.use.setProject();
  const projects = useProjectStore.use.projects();

  const { access: readAccess, loading } = useAccess("PURCHASE_ORDER", "READ");
  const { access: modifyAccess } = useAccess("PURCHASE_ORDER", "MODIFY");

  const form = useForm<PurchaseOrderUpdateSchemaType>({
    resolver: zodResolver(purchaseOrderUpdateSchema),
    defaultValues: {
      amountType: "TTC"
    },
  });

  const { mutate: mutateGetPurchaseOrder, isPending: isGettingPurchaseOrder } = useQueryAction<
    { id: string },
    RequestResponse<PurchaseOrderType>
  >(unique, () => { }, "purchase-order");


  const { mutate: mutateUpdatePurchaseOrder, isPending: isUpdatingPurchaseOrder } = useQueryAction<
    PurchaseOrderUpdateSchemaType,
    RequestResponse<PurchaseOrderType>
  >(update, () => { }, "purchase-order");

  const {
    mutate: mutateGetSuppliers,
    isPending: isGettingSuppliers,
    data: supplierDatas,
  } = useQueryAction<{ id: string }, RequestResponse<SupplierType[]>>(
    getSuppliers,
    () => { },
    "suppliers"
  );

  const { mutate: mutateGetSupplier } = useQueryAction<
    { id: string },
    RequestResponse<SupplierType>
  >(getSupplier, () => { }, "supplier");

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
    mutate: mutateProject,
    isPending: isLoadingProject,
  } = useQueryAction<{ companyId: string }, RequestResponse<ProjectType[]>>(
    getallByCompany,
    () => { },
    "projects"
  );


  const {
    mutate: mutateGetProject,
    isPending: isGettingProject,
  } = useQueryAction<{ id: string }, RequestResponse<ProjectType>>(
    getProject,
    () => { },
    "project"
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
      mutateProject({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            setProject(data.data)
          }
        },
      });
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
    }
  }, [companyId, readAccess])


  useEffect(() => {
    if (param.id && readAccess) {
      initPurchaseOrder()
    }
  }, [param, readAccess])


  useEffect(() => {
    if (supplierId) {
      mutateGetSupplier(
        { id: supplierId },
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
  }, [supplierId]);

  useEffect(() => {
    if (supplierDatas?.data && supplierId) {
      const suppliers = supplierDatas.data;
      setSupplier(suppliers.find((c) => c.id === supplierId));
    }
  }, [supplierId, supplierDatas]);


  useEffect(() => {
    if (items.length > 0) {
      form.setValue("item", {
        productServices: items
          .map((item) => ({
            id: item.id,
            reference: item.reference,
            name: item.name,
            hasTax: item.hasTax,
            selectedQuantity: item.selectedQuantity,
            quantity: item.quantity,
            price: item.price,
            updatedPrice:
              calculate({
                items: [parsePurchaseItem(item)],
                amountType: amountType,
                taxes: company?.vatRates ?? [],
              }).totalWithoutTaxes,
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
      productServices: [],
    });
  }, [items]);

  useEffect(() => {
    form.setValue("paymentLimit", paymentLimit);
  }, [paymentLimit])

  const totals = useMemo(() => {
    const HTPrice = calculate({
      items: parsePurchaseItems(items),
      amountType: amountType,
      taxes: company?.vatRates ?? [],
      discount: [supplierDiscount.discount || 0, supplierDiscount.discountType]
    }).totalWithoutTaxes;

    const TTCPrice = calculate({
      items: parsePurchaseItems(items),
      amountType: amountType,
      taxes: company?.vatRates ?? [],
      discount: [supplierDiscount.discount || 0, supplierDiscount.discountType]
    }).totalWithTaxes

    return { HTPrice, TTCPrice };
  }, [items, company?.vatRates, supplierDiscount]);

  useEffect(() => {
    form.setValue("totalHT", totals.HTPrice);
    form.setValue("totalTTC", totals.TTCPrice);
    form.setValue("discount", String(supplierDiscount.discount));
    form.setValue("discountType", supplierDiscount.discountType);
  }, [totals, supplierDiscount]);

  useEffect(() => {
    if (supplier) {
      if (isFirstLoadingsupplierDiscount.current) {
        isFirstLoadingsupplierDiscount.current = false;
        return
      }
      setSupplierDiscount({
        discount: supplier.discount.includes("%")
          ? Number(supplier.discount.split("%")[0])
          : Number(supplier.discount),
        discountType: "purcent",
      });
    }
  }, [supplier]);

  function initPurchaseOrder() {
    mutateGetPurchaseOrder({ id: param.id as string }, {
      onSuccess(data) {
        if (data.data) {
          const purchaseOrder = data.data;
          setAmountDue(
            purchaseOrder.amountType === "TTC" ? new Decimal(purchaseOrder.totalTTC).minus(purchaseOrder.payee) : new Decimal(purchaseOrder.totalHT).minus(purchaseOrder.payee)
          )
          setPayee(purchaseOrder.payee);
          setCompany(purchaseOrder.company);
          setSupplierId(purchaseOrder.supplierId);
          setPurchaseOrderNumber(purchaseOrder.purchaseOrderNumber);
          setPaymentLimit(purchaseOrder.paymentLimit);
          setLastUploadFiles(purchaseOrder.files.filter((file) => Boolean(file)) ?? []);
          setAmountType(purchaseOrder.amountType);
          setSupplierDiscount({
            discount: Number(purchaseOrder.discount),
            discountType: purchaseOrder.discountType as "purcent" | "money"
          });

          setAmountPaid(new Decimal(purchaseOrder.payee))
          setIsPaid(purchaseOrder.isPaid);

          const mappedItems: PurchaseItemType[] = [...purchaseOrder.items.map(item => ({
            id: item.id,
            reference: item.reference,
            name: item.name,
            hasTax: item.hasTax,
            quantity: Number(item.quantity),
            lastSelectedQuantity: Number(item.quantity),
            selectedQuantity: Number(item.quantity),
            price: new Decimal(item.price),
            updatedPrice: new Decimal(item.updatedPrice),
            itemType: item.itemType as "product" | "service",
            discountType: item.discountType as "purcent" | "money",
            discount: item.discount,
            currency: item.currency,
            description: item.description ?? "",
            productServiceId: item.productServiceId,
          }))];


          form.reset({
            id: purchaseOrder.id,
            companyId: purchaseOrder.companyId,
            purchaseOrderNumber: purchaseOrder.purchaseOrderNumber,
            note: purchaseOrder.note,
            paymentLimit: purchaseOrder.paymentLimit,
            totalHT: purchaseOrder.totalHT,
            totalTTC: purchaseOrder.totalTTC,
            discount: purchaseOrder.discount,
            amountType: purchaseOrder.amountType,
            discountType: purchaseOrder.discountType as "purcent" | "money",
            payee: new Decimal(purchaseOrder.payee),
            supplierId: purchaseOrder.supplierId,
            item: {
              productServices: purchaseOrder.items.filter(item => item.itemType !== "billboard").map(productService => ({
                id: productService.id,
                reference: productService.reference,
                hasTax: productService.hasTax,
                name: productService.name,
                selectedQuantity: productService.quantity,
                quantity: productService.quantity,
                lastQuantity: productService.quantity,
                price: productService.price.toString(),
                updatedPrice: productService.updatedPrice.toString(),
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

          setItems(mappedItems);
          if (purchaseOrder.projectId) {
            mutateGetProject({ id: purchaseOrder.projectId }, {
              onSuccess(data) {
                if (data.data) {
                  const project = data.data;
                  form.setValue("projectId", project.id);
                }
              },
            });
          }

          mutateGetSuppliers({ id: purchaseOrder.companyId }, {
            onSuccess(data) {
              if (data.data && data.data.length > 0 && purchaseOrder.supplierId) {
                const supplierss = data.data;
                setSupplier(supplierss.find((c) => c.id === purchaseOrder.supplierId));
              }
            },
          });
          mutateGetSupplier({ id: purchaseOrder.supplierId })
          mutateGetDocument({ id: purchaseOrder.companyId })
        }
      },
    })
  }

  function removeLastUpload(name: string) {
    setLastUploadFiles((prev) => prev.filter((d) => d !== name));
  }

  const submit = useCallback(
    async (purchaseOrderData: PurchaseOrderUpdateSchemaType) => {
      const { success, data } = purchaseOrderUpdateSchema.safeParse(purchaseOrderData);
      if (!success) return;
      mutateUpdatePurchaseOrder({ ...data, lastUploadFiles }, {
        onSuccess() {
          if (param.id) {
            initPurchaseOrder()
          }
        },
      });
    },
    [mutateUpdatePurchaseOrder, form, lastUploadFiles]
  );

  if (loading) return <Spinner />

  return (
    <AccessContainer hasAccess={readAccess} resource="PURCHASE_ORDER">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="gap-x-4 space-y-4.5 grid grid-cols-[1.5fr_1fr] m-2"
        >
          <div className="space-y-4.5 max-w-lg">
            <div className="space-y-2">
              <h2 className="font-semibold">Fournisseur</h2>
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem className="-space-y-2">
                    <FormControl>
                      <Combobox
                        disabled={amountPaid.gt(0) || !modifyAccess}
                        isLoading={isGettingSuppliers}
                        datas={
                          supplierDatas?.data?.map((supplier) => ({
                            id: supplier.id,
                            label: `${supplier.companyName} - ${supplier.firstname} ${supplier.lastname}`,
                            value: supplier.id,
                          })) ?? []
                        }
                        value={field.value}
                        setValue={(e) => {
                          setSupplierId(e as string);
                          field.onChange(e);
                        }}
                        placeholder="Sélectionner un fournisseur"
                        searchMessage="Rechercher un fournisseur"
                        noResultsMessage="Aucun fournisseur trouvé."
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
                  <ItemList
                    key={item.id}
                    item={item}
                    calculate={calculate}
                    taxes={company?.vatRates ?? []}
                    amountPaid={amountPaid}
                    amountType={amountType}
                    disabled={!modifyAccess}
                  />
                ))}
              </div>
              {amountPaid.eq(0) && modifyAccess &&
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
                          disabled={amountPaid.gt(0) || !modifyAccess}
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
                            disabled: status !== "BLOCKED",
                          }))}
                          value={field.value ?? ""}
                          setValue={(e) => {
                            field.onChange(e);
                          }}
                          placeholder="Sélectionner un projet"
                          searchMessage="Rechercher un projet"
                          noResultsMessage="Aucun projet trouvé."
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
                                      {(!amountPaid.gt(0) || !modifyAccess) &&
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
                        disabled={amountPaid.gt(0) || !modifyAccess}
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
            <PurchaseOrderInfo isGettingDocument={isGettingDocument} isGettingPurchaseOrderNumber={isGettingPurchaseOrder}
              reference={`${documentData?.data?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(purchaseOrderNumber, false)}`}
              discount={supplierDiscount}
              setDiscount={setSupplierDiscount}
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
                  {isUpdatingPurchaseOrder ? <Spinner /> : "Valider"}
                </Button>
              </div>
            }
          </div>
        </form>
      </Form>
    </AccessContainer>
  );
}
