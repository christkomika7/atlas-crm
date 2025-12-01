'use client';

import Header from "@/components/header/header";
import EditForm from "../_components/edit-form";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import Spinner from "@/components/ui/spinner";

export default function EditBillboard() {
  const { access: modifyAccess, loading } = useAccess("BILLBOARDS", "MODIFY");

  if (loading) return <Spinner />
  return (
    <div className="max-h-[calc(100vh-32px)] overflow-hidden">
      <Header back={1} title="Panneaux publicitaires" />
      <AccessContainer hasAccess={modifyAccess} resource="BILLBOARDS" >
        <EditForm />
      </AccessContainer>
    </div>
  );
}
