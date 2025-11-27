'use client';
import Header from "@/components/header/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import DeliveryNoteForm from "./_component/delivery-note-form";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import Spinner from "@/components/ui/spinner";

export default function CreateDeliveryNote() {
  const { access: createAccess, loading } = useAccess("DELIVERY_NOTES", "CREATE");
  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <Header back={1} title="Créer un bon de livraison" />
      {loading ? <Spinner /> :
        <AccessContainer hasAccess={createAccess} resource="DELIVERY_NOTES">
          <ScrollArea className="flex-1 pr-4">
            <DeliveryNoteForm />
          </ScrollArea>
        </AccessContainer>
      }
    </div>
  );
}
