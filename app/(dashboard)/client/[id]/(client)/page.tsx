"use client";

import { Tabs } from "@/components/ui/tabs";
import { tabs } from "./_components/tabs/tab";
import { useParams } from "next/navigation";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { ClientType } from "@/types/client.types";
import { unique } from "@/action/client.action";
import { useEffect } from "react";
import Spinner from "@/components/ui/spinner";
import useClientStore from "@/stores/client.store";

export default function ClientDetails() {
  const param = useParams();
  const setClient = useClientStore.use.setClient();

  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<ClientType>
  >(unique, () => {}, "client");

  useEffect(() => {
    if (param.id) {
      mutate({ id: param.id as string });
    }
  }, [param.id]);

  useEffect(() => {
    if (data?.data) {
      setClient(data.data);
    }
  }, [data]);

  if (isPending) return <Spinner />;
  return (
    <div className="flex flex-col space-y-4 h-full">
      <h2 className="flex-shrink-0 pl-14 font-semibold text-xl">
        {data?.data?.companyName}
      </h2>
      <div className="flex-1 min-h-0">
        <Tabs tabs={tabs} tabId="client-tab" />
      </div>
    </div>
  );
}
