import Header from "@/components/header/header";

export default function SupplierDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-5 h-full max-h-[calc(100vh-4rem)]">
      <div className="flex-shrink-0">
        <Header back={1} title="Informations du fournisseur" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
