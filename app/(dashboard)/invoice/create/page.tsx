"use client";

import InvoiceForm from "./_component/invoice-form";
import Header from "@/components/header/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function CreateInvoice() {
  const createAccess = useAccess("INVOICES", "CREATE");
  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <Header back={1} title="Créer une facture" />
      <AccessContainer hasAccess={createAccess} resource="INVOICES">
        <ScrollArea className="flex-1 pr-4">
          <InvoiceForm />
        </ScrollArea>
      </AccessContainer>
    </div>
  );
}
