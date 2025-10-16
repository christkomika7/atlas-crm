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
import { all as getSuppliers, unique as getSupplier } from "@/action/supplier.action";
import { getallByCompany } from "@/action/project.action";

import useQueryAction from "@/hook/useQueryAction";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import { Combobox } from "@/components/ui/combobox";
import { useDataStore } from "@/stores/data.store";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ProjectType } from "@/types/project.types";
import ItemModal from "./item-modal";
import useProjectStore from "@/stores/project.store";
import { unique } from "@/action/document.action";
import { ModelDocumentType } from "@/types/document.types";
import { useRouter } from "next/navigation";
import { CompanyType } from "@/types/company.types";
import { useCalculateTaxe } from "@/hook/useCalculateTaxe";
import ItemList from "./item-list";
import useTabStore from "@/stores/tab.store";
import { DiscountType } from "@/types/tax.type";
import { cn, generateAmaId, parsePurchaseItem, parsePurchaseItems } from "@/lib/utils";
import { toast } from "sonner";
import { ProductServiceType } from "@/types/product-service.types";
import { getAllProductServices } from "@/action/product-service.action";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Decimal from "decimal.js";
import { purchaseOrderSchema, PurchaseOrderSchemaType } from "@/lib/zod/purchase-order.schema";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { create, purchaseOrderNumber } from "@/action/purchase-order.action";
import { SupplierType } from "@/types/supplier.types";
import PurchaseOrderInfo from "./purchase-order-info";
import { PURCHASE_ORDER_PREFIX } from "@/config/constant";
import useSupplierIdStore from "@/stores/supplier-id.store";
import usePurchaseItemStore from "@/stores/purchase-item.store";

export default function PurchaseOrderForm() {
  const router = useRouter();

  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();

  const setTab = useTabStore.use.setTab();

  const supplierId = useSupplierIdStore.use.supplierId();
  const setSupplierId = useSupplierIdStore.use.setSupplierId();

  const items = usePurchaseItemStore.use.items();
  const updateDiscount = usePurchaseItemStore.use.updateDiscount();
  const clearItem = usePurchaseItemStore.use.clearItem();
  const setItemQuantities = usePurchaseItemStore.use.setItemQuantity();

  const setProject = useProjectStore.use.setProject();
  const projects = useProjectStore.use.projects();

  const [amountType, setAmountType] = useState<"HT" | "TTC">("TTC");
  const [company, setCompany] = useState<CompanyType<string>>();
  const [paymentLimit, setPaymentLimit] = useState("");

  const [supplierDiscount, setSupplierDiscount] = useState<DiscountType>({ discount: 0, discountType: "purcent" });
  const [supplier, setSupplier] = useState<SupplierType>();

  const { calculate } = useCalculateTaxe();

  const form = useForm<PurchaseOrderSchemaType>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      amountType: "TTC"
    },
  });

  const {
    mutate: mutateSuppliers, isPending: isLoadingSuppliers, data: suppliersData } = useQueryAction<{ id: string }, RequestResponse<SupplierType[]>>(
      getSuppliers,
      () => { },
      "suppliers"
    );

  const { mutate: mutateSupplier } = useQueryAction<
    { id: string },
    RequestResponse<SupplierType>
  >(getSupplier, () => { }, "supplier");

  const { mutate, isPending } = useQueryAction<
    PurchaseOrderSchemaType,
    RequestResponse<PurchaseOrderType>
  >(create, () => { }, "purchase-order");

  const {
    mutate: mutateGetPurchaseOrderNumber,
    isPending: isGettingPurchaseOrderNumber,
    data: purchaseOrderNumberData,
  } = useQueryAction<{ companyId: string }, RequestResponse<number>>(
    purchaseOrderNumber,
    () => { },
    "purchase-order-number"
  );

  const {
    mutate: mutateGetDocument,
    isPending: isGettingDocument,
    data: documentData,
  } = useQueryAction<{ id: string }, RequestResponse<ModelDocumentType<File>>>(
    unique,
    () => { },
    "document"
  );

  const {
    mutate: mutateProject,
    isPending: isLoadingProject,
    data: projectData,
  } = useQueryAction<{ companyId: string }, RequestResponse<ProjectType[]>>(
    getallByCompany,
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
      form.setValue("payee", new Decimal(0));
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

      mutateSuppliers({ id: companyId });

      mutateGetPurchaseOrderNumber({ companyId }, {
        onSuccess(data) {
          if (data.data) {
            form.setValue("purchaseOrderNumber", data.data)
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

      mutateProject({ companyId });

    }
  }, [companyId]);

  useEffect(() => {
    if (supplierId) {
      mutateSupplier(
        { id: supplierId },
        {
          onSuccess(data) {
            if (data.data) {
              setPaymentLimit(data.data.paymentTerms);
              updateDiscount(data.data.discount);
            }
          },
        }
      );
    }
  }, [supplierId]);


  useEffect(() => {
    form.watch(() => {
      console.log({ errors: form.formState.errors })
    })
  }, [form.watch])


  useEffect(() => {
    form.setValue("paymentLimit", paymentLimit);
  }, [paymentLimit])

  useEffect(() => {
    if (suppliersData?.data && supplierId) {
      setSupplier(suppliersData.data.find((c) => c.id === supplierId));
    }
  }, [supplierId, suppliersData]);

  useEffect(() => {
    if (projectData?.data) {
      setProject(projectData.data);
    }
  }, [projectData]);


  useEffect(() => {
    if (items.length > 0) {
      form.setValue("item", {
        productServices: items
          .map((item) => ({
            name: item.name,
            quantity: item.quantity,
            selectedQuantity: item.selectedQuantity,
            price: item.price,
            updatedPrice: calculate({
              items: [parsePurchaseItem(item)],
              taxes: company?.vatRates ?? []
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

  const totals = useMemo(() => {
    const HTPrice = calculate({
      items: parsePurchaseItems(items),
      taxes: company?.vatRates ?? [],
      discount: supplierDiscount.discount && supplierDiscount.discountType ? [supplierDiscount.discount, supplierDiscount.discountType] : undefined
    }).totalWithoutTaxes;

    const TTCPrice = calculate({
      items: parsePurchaseItems(items),
      taxes: company?.vatRates ?? [],
      discount: supplierDiscount.discount && supplierDiscount.discountType ? [supplierDiscount.discount, supplierDiscount.discountType] : undefined
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
      setSupplierDiscount({
        discount: supplier.discount.includes("%")
          ? Number(supplier.discount.split("%")[0])
          : Number(supplier.discount),
        discountType: "purcent",
      });
    }
  }, [supplier]);

  const submit = useCallback(
    async (purchaseOrderData: PurchaseOrderSchemaType) => {
      const { success, data } = purchaseOrderSchema.safeParse(purchaseOrderData);

      if (!success) return toast.error("Merci de compléter tous les champs obligatoires.");
      mutate(data, {
        onSuccess(data) {
          if (data.data) {
            setTab("action-purchase-order-tab", 1);
            router.push(`/purchase-order/${data.data.id}`);
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
            <h2 className="font-semibold">Fournisseur</h2>
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem className="-space-y-2">
                  <FormControl>
                    <Combobox
                      isLoading={isLoadingSuppliers}
                      datas={
                        suppliersData?.data?.map((supplier) => ({
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
                <ItemList key={item.productServiceId} item={item} calculate={calculate} taxes={company?.vatRates ?? []} amountPaid={new Decimal(0)} />
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
          <PurchaseOrderInfo isGettingDocument={isGettingDocument} isGettingPurchaseOrderNumber={isGettingPurchaseOrderNumber}
            reference={`${documentData?.data?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(Number(purchaseOrderNumberData?.data || 0), false)}`}
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
            amountType={amountType}
          />
          <div className="flex justify-center pt-2">
            <Button type="submit" variant="primary" className="justify-center">
              {isPending ? <Spinner /> : "Enregistrer"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
