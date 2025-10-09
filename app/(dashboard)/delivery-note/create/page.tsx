import React from "react";
import Header from "@/components/header/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeliveryNoteForm from "./_component/delivery-note-form";

export default function CreateQuote() {
  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <Header back={1} title="Créer un bon de livraison" />
      <ScrollArea className="flex-1 pr-4">
        <DeliveryNoteForm />
      </ScrollArea>
    </div>
  );
}
