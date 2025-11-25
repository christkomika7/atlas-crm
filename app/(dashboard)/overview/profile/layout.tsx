import AccountHeader from "@/components/header/account-header";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-9.5">
        <AccountHeader back={1} title="Profil utilisateur" />
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
