"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import Calendar from "../calendar";
import { useParams } from "next/navigation";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { ItemPlanning, ItemType } from "@/types/item.type";
import { allBillboardItem } from "@/action/item.action";
import { useEffect, useState } from "react";
import Spinner from "@/components/ui/spinner";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";

export default function PlanningTab() {
  const param = useParams();
  const [items, setItems] = useState<ItemPlanning[]>([]);

  const readAccess = useAccess("BILLBOARDS", "READ");

  const { mutate, isPending } = useQueryAction<
    { billboardId: string },
    RequestResponse<ItemType[]>
  >(allBillboardItem, () => { }, "items");

  useEffect(() => {
    if (param.id && readAccess) {
      mutate(
        { billboardId: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              const billboardItems = data.data;
              setItems([
                ...billboardItems.map((billboardItem, index) => ({
                  id: `${index + 1}`,
                  company: billboardItem.billboard.client.companyName,
                  client: `${billboardItem.billboard.client.firstname} ${billboardItem.billboard.client.lastname}`,
                  startDate: new Date(
                    billboardItem.locationStart
                  ).toISOString(),
                  endDate: new Date(billboardItem.locationEnd).toISOString(),
                })),
              ]);
            }
          },
        }
      );
    }
  }, [param, readAccess]);

  if (isPending) return <Spinner />;
  return (
    <AccessContainer hasAccess={readAccess} resource="BILLBOARDS">
      <ScrollArea className="h-[calc(100vh-176px)]">
        <div className="pt-2 pr-4 pb-4">
          <Calendar params={items} />
        </div>
      </ScrollArea>
    </AccessContainer>
  );
}
