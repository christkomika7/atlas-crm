"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { SuppliersTableRef } from "./_components/suppliers-table";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { SupplierType } from "@/types/supplier.types";
import { RequestResponse } from "@/types/api.types";
import { removeMany } from "@/action/supplier.action";
import Spinner from "@/components/ui/spinner";
import SuppliersTable from "./_components/suppliers-table";
import SuppliersCreateModal from "./_components/suppliers-create-modal";

export default function SupplierPage() {
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);

  const suppliersTableRef = useRef<SuppliersTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<SupplierType[]>
  >(removeMany, () => {}, "suppliers");

  const handleSupplierAdded = () => {
    suppliersTableRef.current?.refreshSuppliers();
  };

  function removeSuppliers() {
    if (selectedSupplierIds.length > 0) {
      mutate(
        { ids: selectedSupplierIds },
        {
          onSuccess() {
            setSelectedSupplierIds([]);
            handleSupplierAdded();
          },
        }
      );
    }
  }

  return (
    <div className="flex flex-col justify-between space-y-4 h-full">
      <div className="flex flex-col space-y-9">
        <Header title="Listes des fournisseurs">
          <div className="flex gap-x-2">
            <Button
              variant="primary"
              className="bg-red w-fit font-medium"
              onClick={removeSuppliers}
            >
              {isPending ? (
                <Spinner />
              ) : (
                <>
                  {selectedSupplierIds.length > 0 &&
                    `(${selectedSupplierIds.length})`}{" "}
                  Suppression
                </>
              )}
            </Button>
            <SuppliersCreateModal onSupplierAdded={handleSupplierAdded} />
          </div>
        </Header>
        <div className="flex">
          <SuppliersTable
            ref={suppliersTableRef}
            selectedSupplierIds={selectedSupplierIds}
            setSelectedSupplierIds={setSelectedSupplierIds}
          />
        </div>
      </div>
    </div>
  );
}
