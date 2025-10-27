"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import Spinner from "@/components/ui/spinner";
import HeaderMenu from "./_components/header-menu";
import { DeletedTransactions, TransactionType } from "@/types/transaction.type";
import TransactionTable, {
  TransactionTableRef,
} from "./_components/transaction-table";
import TransactionFilters from "./_components/transaction-filters";
import { deleteTransactions } from "@/action/transaction.action";
import { FilterIcon, FilterXIcon } from "lucide-react";

export default function TransactionPage() {
  const [filters, setFilters] = useState<"empty" | "filter" | "reset">("empty");
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    DeletedTransactions[]
  >([]);
  const transactionTableRef = useRef<TransactionTableRef>(null);

  const { mutate: mutateDeleteTransactions, isPending } = useQueryAction<
    { data: DeletedTransactions[] },
    RequestResponse<TransactionType[]>
  >(deleteTransactions, () => { }, "transactions");

  const handleTransactionAdded = () => {
    transactionTableRef.current?.refreshTransaction();
  };

  function removeTransactions() {
    if (selectedTransactionIds.length > 0) {
      mutateDeleteTransactions(
        { data: selectedTransactionIds },
        {
          onSuccess() {
            setSelectedTransactionIds([]);
            handleTransactionAdded();
          },
        },
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Transactions">
        <div className="gap-x-2 flex items-center">
          {filters === "filter" && (
            <Button
              onClick={() => setFilters("reset")}
              variant="inset-primary"
              className="flex items-center gap-x-2"
            >
              Retirer le filtre
              <FilterXIcon className="w-4 h-4" />
            </Button>
          )}
          <div className="grid grid-cols-[120px_120px_140px] gap-x-2">
            <Button variant="inset-primary">Exporter</Button>
            <Button
              variant="primary"
              className="bg-red font-medium"
              onClick={removeTransactions}
            >
              {isPending ? (
                <Spinner />
              ) : (
                <>
                  {selectedTransactionIds.length > 0 &&
                    `(${selectedTransactionIds.length})`}{" "}
                  Suppression
                </>
              )}
            </Button>
            <HeaderMenu refreshTransaction={handleTransactionAdded} />
          </div>
        </div>
      </Header>
      <div className="space-y-2 h-full w-(--left-sidebar-width)">
        <div className="sticky top-[54px] bg-white z-20 left-0 pb-2">
          <TransactionFilters filters={filters} setFilters={setFilters} />
        </div>
        <div className="p-2">
          <TransactionTable
            ref={transactionTableRef}
            selectedTransactionIds={selectedTransactionIds}
            setSelectedTransactionIds={setSelectedTransactionIds}
          />
        </div>
      </div>
    </div>
  );
}