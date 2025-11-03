"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { ProductServiceType } from "@/types/product-service.types";
import { removeMany } from "@/action/product-service.action";
import { ProductServiceTableRef } from "./_components/product-service-table";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import ProductServiceCreateModal from "./_components/product-service-create-modal";
import ServiceTab from "./_components/tabs/service-tab";
import ProductTab from "./_components/tabs/product-tab";

export default function ProductServicePage() {
  const [selectedProductServiceIds, setProductServiceClientIds] = useState<
    string[]
  >([]);

  const productServiceTableRef = useRef<ProductServiceTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<ProductServiceType[]>
  >(removeMany, () => { }, "product-services");

  const handleProductSelectAdded = () => {
    productServiceTableRef.current?.refreshProductService();
  };

  function removeProductServices() {
    if (selectedProductServiceIds.length > 0) {
      mutate(
        { ids: selectedProductServiceIds },
        {
          onSuccess() {
            setProductServiceClientIds([]);
            handleProductSelectAdded();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Produits & Services">
        <div className="flex gap-x-2">
          <Button
            variant="primary"
            className="bg-red w-fit font-medium"
            onClick={removeProductServices}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                {selectedProductServiceIds.length > 0 &&
                  `(${selectedProductServiceIds.length})`}{" "}
                Suppression
              </>
            )}
          </Button>
          <ProductServiceCreateModal
            onProductServiceAdded={handleProductSelectAdded}
          />
        </div>
      </Header>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "Produits",
            content: (
              <ProductTab
                productServiceTableRef={productServiceTableRef}
                selectedProductServiceIds={selectedProductServiceIds}
                setSelectedProductServiceIds={setProductServiceClientIds}
              />
            ),
          },
          {
            id: 2,
            title: "Services",
            content: (
              <ServiceTab
                productServiceTableRef={productServiceTableRef}
                selectedProductServiceIds={selectedProductServiceIds}
                setSelectedProductServiceIds={setProductServiceClientIds}
              />
            ),
          },
        ]}
        tabId="product-service-tab"
      />
    </div>
  );
}
