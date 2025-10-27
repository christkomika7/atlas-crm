import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { tabs } from "../deletion/tab";

export default function DeletionTab() {
  return <div><Tabs tabs={tabs} tabId="deletion-tab" /></div>;
}
