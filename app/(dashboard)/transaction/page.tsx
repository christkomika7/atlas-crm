"use client";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { removeMany } from "@/action/billboard.action";
import Spinner from "@/components/ui/spinner";
import HeaderMenu from "./_components/header-menu";
import { TransactionType } from "@/types/transaction.type";
import TransactionTable, {
  TransactionTableRef,
} from "./_components/transaction-table";
import TransactionFilters from "./_components/transaction-filters";
import { deleteTransactions } from "@/action/transaction.action";

export default function TransactionPage() {
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    string[]
  >([]);

  const transactionTableRef = useRef<TransactionTableRef>(null);

  const { mutate, isPending } = useQueryAction<
    { ids: string[] },
    RequestResponse<TransactionType[]>
  >(deleteTransactions, () => { }, "transactions");

  const handleAppointmentAdded = () => {
    transactionTableRef.current?.refreshTransaction();
  };

  function removeClients() {
    if (selectedTransactionIds.length > 0) {
      mutate(
        { ids: selectedTransactionIds },
        {
          onSuccess() {
            setSelectedTransactionIds([]);
            handleAppointmentAdded();
          },
        }
      );
    }
  }

  return (
    <div className="space-y-9">
      <Header title="Transactions">
        <div className="gap-x-2 grid grid-cols-[100px_120px_140px]">
          <Button variant="inset-primary">Exporter</Button>
          <Button
            variant="primary"
            className="bg-red font-medium"
            onClick={removeClients}
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
          <HeaderMenu />
        </div>
      </Header>
      <div className="space-y-2">
        <TransactionFilters />
        <TransactionTable
          ref={transactionTableRef}
          selectedTransactionIds={selectedTransactionIds}
          setSelectedTransactionIds={setSelectedTransactionIds}
        />
      </div>
    </div>
  );
}
