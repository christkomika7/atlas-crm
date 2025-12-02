"use client";

import { Tabs } from "@/components/ui/tabs";
import { SearchIcon } from "lucide-react";
import { tabs } from "./tabs/tab";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import UserAccount from "@/components/account/user-account";
import NotificationButton from "@/components/notification/notification-button";
import TextInput from "@/components/ui/text-input";
import useSearchStore from "@/stores/search.store";

export default function SearchTable() {
  const search = useSearchStore.use.search();
  const setSearch = useSearchStore.use.setSearch();
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-x-2">
        <div className="w-full max-w-sm relative">
          <TextInput
            type="search"
            value={search}
            handleChange={(e) => setSearch(String(e))}
            className="pl-8"
          />
          <span className="absolute top-1/2 -translate-y-1/2 left-2.5">
            <SearchIcon className="!size-4 stroke-neutral-600" />
          </span>
        </div>
        <div className="flex gap-x-2">
          <NotificationButton />
          <UserAccount />
        </div>
      </div>
      <ScrollArea className="pb-2 overflow-x-hidden w-full">
        <Tabs tabs={tabs} tabId="overview-tab" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
