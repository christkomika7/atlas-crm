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

export default function ItemForm() {
  const companyId = useDataStore.use.currentCompany();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [productServices, setProductServices] = useState<ProductServiceType[]>([])

  const { mutate: mutateGetProductServices, isPending: isGettingProductServices } = useQueryAction<
    { companyId: string, search?: string; limit?: number },
    RequestResponse<ProductServiceType[]>
  >(getProductServices, () => { }, "product-services");


  useEffect(() => {
    if (companyId) {
      mutateGetProductServices({ companyId, search: "", limit: 5 }, {
        onSuccess(data) {
          if (data.data) {
            setProductServices(data.data);
          }
        },
      })
    }
  }, [companyId]);


  useEffect(() => {
    if (companyId) {
      mutateGetProductServices({ companyId, search: debouncedSearch, limit: 5 }, {
        onSuccess(data) {
          if (data.data) {
            setProductServices(data.data);
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
      <ProductServiceTab isGettingProductServices={isGettingProductServices} productServices={productServices} />
    </div>
  );
}
