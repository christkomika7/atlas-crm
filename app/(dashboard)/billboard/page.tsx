"use client";

import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { removeMany } from "@/action/billboard.action";
import Spinner from "@/components/ui/spinner";
import BillboardTable, { BillboardTableRef } from "./_component/billboard-table";
import HeaderMenu from "./_component/header-menu";
import { BillboardType } from "@/types/billboard.types";
import { useAccess } from "@/hook/useAccess";

export default function BillboardPage() {
  const [selectedBillboardIds, setSelectedBillboardIds] = useState<string[]>(
    []
  );

  const billboardTableRef = useRef<BillboardTableRef>(null);

  const { access: createAccess } = useAccess("BILLBOARDS", "CREATE");
  const { access: modifyAccess } = useAccess("BILLBOARDS", "MODIFY");

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<BillboardType[]>
  >(removeMany, () => { }, "billboards");

  const handleAppointmentAdded = () => {
    billboardTableRef.current?.refreshBillboard();
  };

  function removeClients() {
    if (selectedBillboardIds.length > 0) {
      mutate(
        { ids: selectedBillboardIds },
        {
          onSuccess() {
            setSelectedBillboardIds([]);
            handleAppointmentAdded();
          },
        }
      );
    }
  }


  return (
    <div className="space-y-9">
      <Header title="Panneau publicitaire">
        <div className="gap-x-2 grid grid-cols-[120px_100px]">
          {modifyAccess &&
            <Button
              variant="primary"
              className="bg-red font-medium"
              onClick={removeClients}
            >
              {isPending ? (
                <Spinner />
              ) : (
                <>
                  {selectedBillboardIds.length > 0 &&
                    `(${selectedBillboardIds.length})`}{" "}
                  Suppression
                </>
              )}
            </Button>
          }
          {createAccess &&
            <HeaderMenu />
          }
        </div>
      </Header>
      <BillboardTable
        ref={billboardTableRef}
        selectedBillboardIds={selectedBillboardIds}
        setSelectedBillboardIds={setSelectedBillboardIds}
      />
    </div>
  );
}
