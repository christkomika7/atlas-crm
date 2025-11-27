'use client';

import { useAccess } from "@/hook/useAccess";
import NewEmployeeEditForm from "../../_components/new-employee-edit-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import AccessContainer from "@/components/errors/access-container";
import Spinner from "@/components/ui/spinner";

export default function EditEmployee() {
  const { access: modifyAccess, loading } = useAccess("SETTING", "MODIFY");

  if (loading) return <Spinner />

  return (
    <AccessContainer hasAccess={modifyAccess} resource="SETTING" >
      <div className="h-full">
        <ScrollArea className="w-full h-full">
          <div className="pr-2">
            <NewEmployeeEditForm />
          </div>
        </ScrollArea>
      </div>
    </AccessContainer>
  );
}
