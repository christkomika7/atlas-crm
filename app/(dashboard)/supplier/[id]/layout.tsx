import Header from "@/components/header/header";
import HeaderActionButton from "./_components/header-action-button";

export default function SupplierDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-5 h-full max-h-[calc(100vh-4rem)]">
      <div className="flex-shrink-0">
        <Header back={1} title="Informations du fournisseur">
          <HeaderActionButton />
        </Header>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
