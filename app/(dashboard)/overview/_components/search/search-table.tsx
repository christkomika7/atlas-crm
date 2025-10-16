"use client";
import UserAccount from "@/components/account/user-account";
import NotificationButton from "@/components/notification/notification-button";
import { Tabs } from "@/components/ui/tabs";
import TextInput from "@/components/ui/text-input";
import { SearchIcon } from "lucide-react";
import React, { useState } from "react";
import { tabs } from "./tabs/tab";

export default function SearchTable() {
  const [search, setSearch] = useState("");
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
      <Tabs tabs={tabs} tabId="overview-tab" />
    </div>
  );
}
