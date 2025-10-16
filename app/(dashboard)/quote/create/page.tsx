import React from "react";
import Header from "@/components/header/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuoteForm from "./_component/quote-form";

export default function CreateQuote() {
  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <Header back={1} title="Créer un devis" />
      <ScrollArea className="flex-1 pr-4">
        <QuoteForm />
      </ScrollArea>
    </div>
  );
}
