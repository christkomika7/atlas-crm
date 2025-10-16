import { useDebounce } from "use-debounce";
import React, { useEffect, useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import BillboardTab from "./tabs/billboard-tab";
import ProductServiceTab from "./tabs/product-service-tab";
import useTabStore from "@/stores/tab.store";
import TextInput from "@/components/ui/text-input";
import { BillboardType } from "@/types/billboard.types";
import { RequestResponse } from "@/types/api.types";
import { all as getBillboards } from "@/action/billboard.action";
import useQueryAction from "@/hook/useQueryAction";
import { useDataStore } from "@/stores/data.store";
import { ProductServiceType } from "@/types/product-service.types";
import { all as getProductServices } from "@/action/product-service.action";

export default function ItemForm() {
  const companyId = useDataStore.use.currentCompany();
  const tab = useTabStore.use.tabs()["item-tab"];
  const [currentTab, setCurrentTab] = useState<"billboard" | "product">();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [billboards, setBillboards] = useState<BillboardType[]>([]);
  const [productServices, setProductServices] = useState<ProductServiceType[]>([])

  const { mutate: mutateGetBillboards, isPending: isGettingBillboards } = useQueryAction<
    { companyId: string, search?: string; limit?: number },
    RequestResponse<BillboardType[]>
  >(getBillboards, () => { }, "billboards");


  const { mutate: mutateGetProductServices, isPending: isGettingProductServices } = useQueryAction<
    { companyId: string, search?: string; limit?: number },
    RequestResponse<ProductServiceType[]>
  >(getProductServices, () => { }, "product-services");

  useEffect(() => {
    setCurrentTab(tab === 0 ? "billboard" : "product")
  }, [])

  useEffect(() => {
    if (companyId) {

      if (currentTab === "billboard") {
        mutateGetBillboards({ companyId, search: "", limit: 5 }, {
          onSuccess(data) {
            if (data.data) {
              setBillboards(data.data)
            }
          },
        })
      } else {
        mutateGetProductServices({ companyId, search: "", limit: 5 }, {
          onSuccess(data) {
            if (data.data) {
              setProductServices(data.data);
            }
          },
        })
      }

    }
  }, [companyId, currentTab]);


  useEffect(() => {
    setSearch("");
    setCurrentTab(tab === 0 ? "billboard" : "product")
  }, [tab])

  useEffect(() => {
    if (companyId) {
      if (currentTab === "billboard") {
        mutateGetBillboards({ companyId, search: debouncedSearch, limit: 5 }, {
          onSuccess(data) {
            if (data.data) {
              setBillboards(data.data)
            }
          },
        })
      } else {
        mutateGetProductServices({ companyId, search: debouncedSearch, limit: 5 }, {
          onSuccess(data) {
            if (data.data) {
              setProductServices(data.data);
            }
          },
        })
      }

    }
  }, [debouncedSearch, companyId]);

  return (
    <div className="relative">
      <Tabs
        tabs={[
          { id: 1, title: "Panneau publicitaire", content: <BillboardTab isGettingBillboards={isGettingBillboards} billboards={billboards} /> },
          { id: 2, title: "Produit et service", content: <ProductServiceTab isGettingProductServices={isGettingProductServices} productServices={productServices} /> },
        ]}
        tabId="item-tab"
      />
      <div className="absolute top-0 left-[65%] w-sm -translate-x-1/2">
        <TextInput
          type="search"
          design="float"
          label="Recherche"
          required={false}
          value={search}
          handleChange={(e) => setSearch(e as string)}
        />
      </div>
    </div>
  );
}
