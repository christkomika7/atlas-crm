import AccountHeader from "@/components/header/account-header";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditSupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-9.5 h-full">
      <div className="flex-shrink-0 mb-9.5">
        <AccountHeader back={1} title="Modification du fournisseur" />
      </div>
      <div className="flex-1 min-h-0">
        <ScrollArea className="w-full h-full">
          <div className="pr-2 max-w-5xl">{children}</div>
        </ScrollArea>
      </div>
    </div>
  );
}
