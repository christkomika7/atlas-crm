'use client';

import Header from "@/components/header/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuoteForm from "./_component/quote-form";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function CreateQuote() {
  const createAccess = useAccess("QUOTES", "CREATE");

  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <Header back={1} title="Créer un devis" />
      <AccessContainer hasAccess={createAccess} resource="QUOTES">
        <ScrollArea className="flex-1 pr-4">
          <QuoteForm />
        </ScrollArea>
      </AccessContainer>
    </div>
  );
}
