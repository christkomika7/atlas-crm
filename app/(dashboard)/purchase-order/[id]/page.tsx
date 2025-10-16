import React from "react";
import Header from "@/components/header/header";
import { Tabs } from "@/components/ui/tabs";
import PreviewTab from "./_component/tabs/preview-tab";
import ShareTab from "./_component/tabs/share-tab";
import PurchaseOrderTab from "./_component/tabs/purchase-order-tab";

export default function UpdatePurchaseOrder() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header back={1} title="Créer un bon de commande" />
      <div className="flex-1 px-6 py-4 overflow-auto">
        <Tabs
          tabs={[
            { id: 1, title: "Modifier", content: <PurchaseOrderTab /> },
            { id: 2, title: "Aperçu", content: <PreviewTab /> },
            { id: 3, title: "Partage", content: <ShareTab /> },
          ]}
          tabId="action-purchase-order-tab"
        />
      </div>
    </div>
  );
}
