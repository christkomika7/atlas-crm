"use client";

import useTabStore from "@/stores/tab.store";
import { Button } from "@/components/ui/button";
import { useDataStore } from "@/stores/data.store";
import { removeMany as removePurchaseOrder } from "@/action/purchase-order.action";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import Spinner from "@/components/ui/spinner";
import { useAccess } from "@/hook/useAccess";
import { PurchaseOrderType } from "@/types/purchase-order.types";
import { useEffect } from "react";
import ActionsButton from "./actions-button";

export default function HeaderActionButton() {
  const currentSupplierTab = useTabStore.use.tabs()["supplier-tab"];

  const reset = useDataStore.use.reset();
  const ids = useDataStore.use.ids();
  const clearIds = useDataStore.use.clearIds();

  const { access: modifyPurchaseOrderAccess } = useAccess("PURCHASE_ORDER", "MODIFY");

  const { mutate: mutateDeletePurchaseOrder, isPending: isDeletingPurchaseOrder } = useQueryAction<
    { ids: string[] },
    RequestResponse<PurchaseOrderType[]>
  >(removePurchaseOrder, () => { }, "purchase-order");

  useEffect(() => {
    clearIds();
  }, [currentSupplierTab]);

  function removeRecord() {
    if (ids.length === 0) return;

    mutateDeletePurchaseOrder({ ids }, {
      onSuccess() {
        clearIds();
        reset();
      }
    })
  }

  console.log({ currentSupplierTab })

  const renderContent = () => {
    switch (currentSupplierTab) {
      case 0:
        return (

          <div className="flex gap-x-2">
            {modifyPurchaseOrderAccess &&
              <Button
                onClick={removeRecord}
                variant="delete"
                className="w-fit font-medium"
              >
                Suppression {ids.length > 0 && `(${ids.length})`}{" "}
                {isDeletingPurchaseOrder && (
                  <Spinner size={15} />
                )}
              </Button>
            }
            <ActionsButton />
          </div>
        );
      case 1:
        return <></>;
      default:
        return null;
    }
  };

  return <div className="h-12">{renderContent()}</div>;
}
