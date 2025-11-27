'use client';
import { Tabs } from "@/components/ui/tabs";
import { tabs } from "../deletion/tab";
import { useAccess } from "@/hook/useAccess";
import Spinner from "@/components/ui/spinner";
import AccessContainer from "@/components/errors/access-container";

export default function DeletionTab() {
  const { access: modifyAccess, loading } = useAccess("SETTING", "MODIFY");
  if (loading) return <Spinner />
  return <AccessContainer hasAccess={modifyAccess} resource="SETTING" >
    <div>
      <Tabs tabs={tabs} tabId="deletion-tab" />
    </div>
  </AccessContainer>
}
