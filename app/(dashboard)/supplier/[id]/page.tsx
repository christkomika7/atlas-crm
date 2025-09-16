"use client";

import { Tabs } from "@/components/ui/tabs";
import { tabs } from "./_components/tabs/tab";
import { useParams } from "next/navigation";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { SupplierType } from "@/types/supplier.types";
import { unique } from "@/action/supplier.action";
import { useEffect } from "react";
import Spinner from "@/components/ui/spinner";
import useSupplierStore from "@/stores/supplier.store";

export default function SupplierDetails() {
  const param = useParams();
  const setSupplier = useSupplierStore.use.setSupplier();

  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<SupplierType>
  >(unique, () => {}, "supplier");

  useEffect(() => {
    if (param.id) {
      mutate({ id: param.id as string });
    }
  }, [param.id]);

  useEffect(() => {
    if (data?.data) {
      setSupplier(data.data);
    }
  }, [data]);

  if (isPending) return <Spinner />;
  return (
    <div className="flex flex-col space-y-4 h-full">
      <h2 className="flex-shrink-0 pl-14 font-semibold text-xl">
        {data?.data?.companyName}
      </h2>
      <div className="flex-1 min-h-0">
        <Tabs tabs={tabs} tabId="supplier-tab" />
      </div>
    </div>
  );
}
