'use client';

import Header from "@/components/header/header";
import EditForm from "../_components/edit-form";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function EditBillboard() {
  const { access: modifyAccess, loading } = useAccess("BILLBOARDS", "MODIFY");

  return (
    <div className="max-h-[calc(100vh-32px)] overflow-hidden">
      <Header back={1} title="Panneaux publicitaires" />
      <AccessContainer hasAccess={modifyAccess} resource="BILLBOARDS" loading={loading} >
        <EditForm />
      </AccessContainer>
    </div>
  );
}
