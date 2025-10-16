import React from "react";
import InvoiceForm from "./_component/invoice-form";
import Header from "@/components/header/header";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CreateInvoice() {
  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <Header back={1} title="Créer une facture" />
      <ScrollArea className="flex-1 pr-4">
        <InvoiceForm />
      </ScrollArea>
    </div>
  );
}
