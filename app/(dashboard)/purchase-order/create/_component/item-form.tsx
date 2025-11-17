'use client';

import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import ProductServiceTab from "./tabs/product-service-tab";
import TextInput from "@/components/ui/text-input";
import { RequestResponse } from "@/types/api.types";
import useQueryAction from "@/hook/useQueryAction";
import { useDataStore } from "@/stores/data.store";
import { ProductServiceType } from "@/types/product-service.types";
import { all as getProductServices } from "@/action/product-service.action";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";

export default function ItemForm() {
  const companyId = useDataStore.use.currentCompany();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [productServices, setProductServices] = useState<ProductServiceType[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState<number>(0);

  const skip = (currentPage - 1) * pageSize;

  const { mutate: mutateGetProductServices, isPending: isGettingProductServices } = useQueryAction<
    { companyId: string; search?: string; skip?: number; take?: number },
    RequestResponse<ProductServiceType[]>
  >(getProductServices, () => { }, "product-services");


  useEffect(() => {
    if (companyId) {
      mutateGetProductServices({ companyId, search: "", skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setProductServices(data.data);
            setTotalItems(data.total ?? 0);
          }
        },
      })
    }
  }, [companyId]);


  useEffect(() => {
    if (companyId) {
      mutateGetProductServices({ companyId, search: "", skip, take: pageSize }, {
        onSuccess(data) {
          if (data.data) {
            setProductServices(data.data);
            setTotalItems(data.total ?? 0);
          }
        },
      })
    }
  }, [debouncedSearch, companyId]);

  return (
    <div>
      <div className="w-sm">
        <TextInput
          type="search"
          design="float"
          label="Recherche"
          required={false}
          value={search}
          handleChange={(e) => setSearch(e as string)}
        />
      </div>
      <ProductServiceTab isGettingProductServices={isGettingProductServices} productServices={productServices} totalItems={totalItems} setCurrentPage={setCurrentPage} currentPage={currentPage} pageSize={pageSize} />    </div>
  );
}
