"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { removeMany } from "@/action/purchase-order.action";
import Spinner from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { PurchaseOrderTableRef } from "./_component/purchase-order-table";
import UnpaidTab from "./_component/tabs/unpaid-tab";
import PaidTab from "./_component/tabs/paid-tab";
import Link from "next/link";
import { PurchaseOrderType } from "@/types/purchase-order.types";

export default function PurchaseOrderPage() {
  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState<string[]>([]);

  const purchaseOrderTableRef = useRef<PurchaseOrderTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<PurchaseOrderType[]>
  >(removeMany, () => { }, "purchase-order");

  const handlePurchaseOrderAdded = () => {
    purchaseOrderTableRef.current?.refreshPurchaseOrder();
  };

  function removePurchaseOrders() {
    if (selectedPurchaseOrderIds.length > 0) {
      mutate(
        { ids: selectedPurchaseOrderIds },
        {
          onSuccess() {
            setSelectedPurchaseOrderIds([]);
            handlePurchaseOrderAdded();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Bon de commande">
        <div className="flex gap-x-2">
          <Button
            variant="primary"
            className="bg-red w-fit font-medium"
            onClick={removePurchaseOrders}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <>
                {selectedPurchaseOrderIds.length > 0 &&
                  `(${selectedPurchaseOrderIds.length})`}{" "}
                Suppression
              </>
            )}
          </Button>
          <Link href="/purchase-order/create">
            <Button variant="primary" className="font-medium">
              Nouveau bon de commande
            </Button>
          </Link>
        </div>
      </Header>
      <Tabs
        tabs={[
          {
            id: 1,
            title: "Bon de commande impayée",
            content: (
              <UnpaidTab
                purchaseOrderTableRef={purchaseOrderTableRef}
                selectedPurchaseOrderIds={selectedPurchaseOrderIds}
                setSelectedPurchaseOrderIds={setSelectedPurchaseOrderIds}
              />
            ),
          },
          {
            id: 2,
            title: "Bon de commande réglée",
            content: (
              <PaidTab
                purchaseOrderTableRef={purchaseOrderTableRef}
                selectedPurchaseOrderIds={selectedPurchaseOrderIds}
                setSelectedPurchaseOrderIds={setSelectedPurchaseOrderIds}
              />
            ),
          },
        ]}
        tabId="purchase-order-tab"
      />
    </div>
  );
}
