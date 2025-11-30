'use client';
import { Tabs } from "@/components/ui/tabs";
import { tabs } from "../deletion/tab";
import { useAccess } from "@/hook/useAccess";
import Spinner from "@/components/ui/spinner";
import AccessContainer from "@/components/errors/access-container";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function DeletionTab() {
  const { access: modifyAccess, loading } = useAccess("SETTING", "MODIFY");
  if (loading) return <Spinner />
  return <AccessContainer hasAccess={modifyAccess} resource="SETTING" >
    <ScrollArea className="w-(--deletion-width) overflow-x-hidden pb-2">
      <Tabs tabs={tabs} tabId="deletion-tab" />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </AccessContainer>
}
