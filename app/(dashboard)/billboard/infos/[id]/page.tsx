"use client";
import Header from "@/components/header/header";
import { Tabs } from "@/components/ui/tabs";
import { tab } from "../_component/tabs/tab";
import DownloadContractButton from "../_component/download-contract-button";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { BillboardType } from "@/types/billboard.types";
import { unique } from "@/action/billboard.action";
import Spinner from "@/components/ui/spinner";

export default function BillboardInfoPage() {
  const param = useParams();
  const { mutate, isPending, data } = useQueryAction<
    { id: string },
    RequestResponse<BillboardType>
  >(unique, () => { }, "billboard");

  useEffect(() => {
    if (param.id) {
      mutate({ id: param.id as string });
    }
  }, [param]);

  return (
    <div className="flex flex-col h-full">
      <Header back={1} title="Détails du panneaux publicitaires">
        <DownloadContractButton />
      </Header>

      <div className="flex flex-col flex-1 min-h-0">
        <h2 className="flex items-center gap-x-2 mb-4 pl-20 font-medium">
          <span className="font-semibold text-blue">REF NO: </span>{" "}
          {isPending && data ? <Spinner size={10} /> : data?.data?.reference}
        </h2>

        <div className="flex-1 min-h-0">
          <Tabs tabs={tab} tabId="billboard-details-tab" />
        </div>
      </div>
    </div>
  );
}
