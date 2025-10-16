import React from "react";
import Header from "@/components/header/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import PurchaseOrderForm from "./_component/purchase-order-form";

export default function CreatePurchaseOrder() {
  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <Header back={1} title="Créer un bon de commande" />
      <ScrollArea className="flex-1 pr-4">
        <PurchaseOrderForm />
      </ScrollArea>
    </div>
  );
}
