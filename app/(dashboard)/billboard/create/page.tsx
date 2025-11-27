'use client';

import Header from "@/components/header/header";
import CreateForm from "./_components/create-form";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function CreateBillboard() {
  const { access: createAccess } = useAccess("BILLBOARDS", "CREATE");

  return (
    <div className="max-h-[calc(100vh-32px)] overflow-hidden">
      <Header back={1} title="Panneaux publicitaires" />
      <AccessContainer hasAccess={createAccess} resource="BILLBOARDS" >
        <CreateForm />
      </AccessContainer>
    </div>
  );
}
