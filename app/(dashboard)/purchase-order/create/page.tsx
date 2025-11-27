import React from "react";
import Header from "@/components/header/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import PurchaseOrderForm from "./_component/purchase-order-form";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import Spinner from "@/components/ui/spinner";

export default function CreatePurchaseOrder() {
  const { access: createAccess, loading } = useAccess("PURCHASE_ORDER", "CREATE");
  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <Header back={1} title="Créer un bon de commande" />
      {loading ? <Spinner /> :
        <AccessContainer hasAccess={createAccess} resource="PURCHASE_ORDER">
          <ScrollArea className="flex-1 pr-4">
            <PurchaseOrderForm />
          </ScrollArea>
        </AccessContainer>
      }
    </div>
  );
}
