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
import { DEFAULT_PAGE_SIZE } from "@/config/constant";

export default function ItemForm() {
  const companyId = useDataStore.use.currentCompany();
  const tab = useTabStore.use.tabs()["item-tab"];
  const [currentTab, setCurrentTab] = useState<"billboard" | "product">();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [billboards, setBillboards] = useState<BillboardType[]>([]);
  const [productServices, setProductServices] = useState<ProductServiceType[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;


  const { mutate: mutateGetBillboards, isPending: isGettingBillboards } = useQueryAction<
    { companyId: string, search?: string; limit?: number, skip?: number; take?: number },
    RequestResponse<BillboardType[]>
  >(getBillboards, () => { }, "billboards");


  const { mutate: mutateGetProductServices, isPending: isGettingProductServices } = useQueryAction<
    { companyId: string, search?: string; limit?: number, skip?: number; take?: number },
    RequestResponse<ProductServiceType[]>
  >(getProductServices, () => { }, "product-services");

  useEffect(() => {
    setCurrentTab(tab === 0 ? "billboard" : "product")
  }, [])

  useEffect(() => {
    if (companyId) {

      if (currentTab === "billboard") {
        mutateGetBillboards({ companyId, search: "", limit: DEFAULT_PAGE_SIZE, skip, take: pageSize }, {
          onSuccess(data) {
            if (data.data) {
              setBillboards(data.data)
              setTotalItems(data.total ?? 0);
            }
          },
        })
      } else {
        mutateGetProductServices({ companyId, search: "", limit: DEFAULT_PAGE_SIZE, skip, take: pageSize }, {
          onSuccess(data) {
            if (data.data) {
              setProductServices(data.data);
              setTotalItems(data.total ?? 0);
            }
          },
        })
      }

    }
  }, [companyId, currentTab]);


  useEffect(() => {
    setSearch("");
    setCurrentPage(1);
    setTotalItems(0);
    setCurrentTab(tab === 0 ? "billboard" : "product")
  }, [tab])

  useEffect(() => {
    if (companyId) {
      if (currentTab === "billboard") {
        mutateGetBillboards({ companyId, search: debouncedSearch, limit: DEFAULT_PAGE_SIZE, skip, take: pageSize }, {
          onSuccess(data) {
            if (data.data) {
              setBillboards(data.data)
              setTotalItems(data.total ?? 0);
            }
          },
        })
      } else {
        mutateGetProductServices({ companyId, search: debouncedSearch, limit: DEFAULT_PAGE_SIZE, skip, take: pageSize }, {
          onSuccess(data) {
            if (data.data) {
              setProductServices(data.data);
              setTotalItems(data.total ?? 0);
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
          { id: 1, title: "Panneau publicitaire", content: <BillboardTab isGettingBillboards={isGettingBillboards} billboards={billboards} totalItems={totalItems} setCurrentPage={setCurrentPage} currentPage={currentPage} pageSize={pageSize} /> },
          { id: 2, title: "Produit et service", content: <ProductServiceTab isGettingProductServices={isGettingProductServices} productServices={productServices} totalItems={totalItems} setCurrentPage={setCurrentPage} currentPage={currentPage} pageSize={pageSize} /> },
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
