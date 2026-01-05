"use client";

import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAccess } from "@/hook/useAccess";
import { useDataStore } from "@/stores/data.store";
import { useParams } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

import ModalContainer from "@/components/modal/modal-container";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { unique as getSupplier } from "@/action/supplier.action";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplierType } from "@/types/supplier.types";
import useSupplierStore from "@/stores/supplier.store";
import PurchaseOrderModal from "@/components/modal/purchase-order-modal";
import SupplierRevenueModal from "@/components/modal/supplier-revenu-modal";

export default function ActionsButton() {
  const [open, setOpen] = useState({
    purchaseOrder: false,
    revenue: false,
  });

  const param = useParams();
  const reset = useDataStore.use.reset();
  const setSupplier = useSupplierStore.use.setSupplier();
  const supplier = useSupplierStore.use.supplier();

  const { access: createPurchaseOrderAccess } = useAccess("PURCHASE_ORDER", "CREATE");
  const { access: createTransactionAccess } = useAccess("TRANSACTION", "CREATE");

  const hasAccess = createPurchaseOrderAccess || createTransactionAccess;


  const { mutate: mutateSupplier, isPending: isGettingSupplier } = useQueryAction<
    { id: string },
    RequestResponse<SupplierType>
  >(getSupplier, () => { }, "supplier");

  useEffect(() => {
    if (param.id) {
      mutateSupplier(
        { id: param.id as string },
        {
          onSuccess(data) {
            if (data.data) {
              setSupplier(data.data);
            }
          },
        }
      );
    }

  }, [param])

  if (!hasAccess) return null;
  if (isGettingSupplier) return <Skeleton className="w-[120px] h-[48px]" />

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          className="flex justify-center items-center w-[120px] font-medium"
        >
          Nouveau
          <ChevronDownIcon className="top-0.5 relative !size-3 stroke-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-1 w-[210px]">
        {createPurchaseOrderAccess && (
          <ModalContainer
            size="2xl"
            action={
              <Button className="bg-white hover:bg-blue justify-start shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]">
                Créer un bon de commande
              </Button>
            }
            title="Bon de commande"
            open={open.purchaseOrder}
            setOpen={(value: SetStateAction<boolean>) =>
              setOpen((prev) => ({ ...prev, purchaseOrder: value as boolean }))
            }
          >
            <PurchaseOrderModal
              idSupplier={param.id as string}
              refreshData={() => reset()}
              closeModal={() => setOpen((prev) => ({ ...prev, purchaseOrder: false }))}
            />
          </ModalContainer>
        )}

        {createTransactionAccess && (
          <ModalContainer
            size="3xl"
            action={
              <Button className="bg-white justify-start hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]">
                Générer un relevé
              </Button>
            }
            title={`Relevé concernant ${supplier?.firstname} ${supplier?.lastname} (${supplier?.companyName})`}
            open={open.revenue}
            setOpen={(value: SetStateAction<boolean>) =>
              setOpen((prev) => ({ ...prev, revenue: value as boolean }))
            }
          >
            <SupplierRevenueModal
            />
          </ModalContainer>
        )}
      </PopoverContent>
    </Popover>
  );
}
