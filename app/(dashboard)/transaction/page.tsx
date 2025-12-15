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
import { FilterXIcon } from "lucide-react";
import { useDataStore } from "@/stores/data.store";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import { Skeleton } from "@/components/ui/skeleton";
import ExportButton from "./export-button";

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const companyId = useDataStore.use.currentCompany();
  const [filters, setFilters] = useState<"empty" | "filter" | "reset">("empty");
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    DeletedTransactions[]
  >([]);
  const transactionTableRef = useRef<TransactionTableRef>(null);


  const { access: createAccess, loading: loadingCreateAccess } = useAccess("TRANSACTION", "CREATE");
  const { access: modifyAcccess, loading: loadingModifyAccess } = useAccess("TRANSACTION", "MODIFY");
  const { access: readAccess, loading: loadingReadAccess } = useAccess("TRANSACTION", "READ");

  const { mutate: mutateDeleteTransactions, isPending } = useQueryAction<
    { data: DeletedTransactions[], companyId: string },
    RequestResponse<TransactionType[]>
  >(deleteTransactions, () => { }, "transactions");

  const handleTransactionAdded = () => {
    transactionTableRef.current?.refreshTransaction();
  };

  function removeTransactions() {
    if (selectedTransactionIds.length > 0) {
      mutateDeleteTransactions(
        { data: selectedTransactionIds, companyId },
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
    <div className="space-y-9 h-full">
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
            {loadingReadAccess ? <Skeleton className="w-[120px] h-[48px]" /> : <>
              {readAccess &&
                <ExportButton transactions={transactions} isLoading={isPending} />
              }
            </>
            }
            {loadingModifyAccess ? <Skeleton className="w-[120px] h-[48px]" /> : <>
              {modifyAcccess &&
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
              }
            </>}

            {loadingCreateAccess ? <Skeleton className="w-[140px] h-[48px]" /> : <>
              {createAccess &&
                <HeaderMenu refreshTransaction={handleTransactionAdded} />
              }
            </>}
          </div>
        </div>
      </Header>

      <div className="space-y-2 h-full w-(--left-sidebar-width)">
        <AccessContainer hasAccess={readAccess} resource="TRANSACTION" loading={loadingReadAccess}>
          <>
            <div className="sticky top-[54px] bg-white z-20 left-0 pb-2">
              <TransactionFilters filters={filters} setFilters={setFilters} />
            </div>
            <div className="p-2">
              <TransactionTable
                ref={transactionTableRef}
                selectedTransactionIds={selectedTransactionIds}
                setSelectedTransactionIds={setSelectedTransactionIds}
                setTransactions={setTransactions}
                setIsPending={setIsLoading}
              />
            </div>
          </>
        </AccessContainer>
      </div>
    </div>
  );
}