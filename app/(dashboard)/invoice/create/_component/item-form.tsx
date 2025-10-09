import { Tabs } from "@/components/ui/tabs";
import React from "react";
import BillboardTab from "./tabs/billboard-tab";
import ProductServiceTab from "./tabs/product-service-tab";

export default function ItemForm() {
  return (
    <div>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "Panneau publicitaire",
            content: <BillboardTab />,
          },
          {
            id: 1,
            title: "Produit et service",
            content: <ProductServiceTab />,
          },
        ]}
        tabId="item-tab"
      />
    </div>
  );
}
