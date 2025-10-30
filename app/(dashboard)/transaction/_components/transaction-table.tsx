"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useRef,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import { useSearchParams } from "next/navigation";
import { getTransactions } from "@/action/transaction.action";
import {
  DeletedTransactions,
  GetTransactionsParams,
  TransactionType,
} from "@/types/transaction.type";
import {
  ChevronsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { formatDateToDashModel } from "@/lib/date";
import { cutText, formatNumber, getDocumentRef } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import { $Enums } from "@/lib/generated/prisma";
import { acceptPayment } from "@/lib/data";

type TransactionTableProps = {
  selectedTransactionIds: DeletedTransactions[];
  setSelectedTransactionIds: Dispatch<SetStateAction<DeletedTransactions[]>>;
};

export interface TransactionTableRef {
  refreshTransaction: () => void;
}

type SortField =
  | "byDate"
  | "byAmount"
  | "byMovement"
  | "byCategory"
  | "byNature"
  | "byDescription"
  | "byPaymentMode"
  | "byAllocation"
  | "bySource"
  | "byPaidOnBehalfOf";

const TransactionTable = forwardRef<TransactionTableRef, TransactionTableProps>(
  ({ selectedTransactionIds, setSelectedTransactionIds }, ref) => {
    const searchParams = useSearchParams();
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const currency = useDataStore.use.currency();
    const companyId = useDataStore.use.currentCompany();

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const movement = searchParams.get("movement");
    const paymentMode = searchParams.get("paymentMode");
    const source = searchParams.get("source");
    const paidFor = searchParams.get("paidFor");

    const [cursor, setCursor] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const { mutate: mutateGetTransactions, isPending: isGettingTransactions } =
      useQueryAction<GetTransactionsParams, RequestResponse<TransactionType[]>>(
        getTransactions,
        () => { },
        "transactions",
      );

    const toggleSelection = (transactionId: string, checked: boolean, transactionType: $Enums.TransactionType) => {
      setSelectedTransactionIds((prev) =>
        checked
          ? [...prev, { id: transactionId, transactionType }]
          : prev.filter((transac) => transac.id !== transactionId),
      );
    };

    // Fonction pour construire les paramètres de tri
    const buildSortParams = (field: SortField, order: "asc" | "desc") => {
      const params: Partial<GetTransactionsParams> = {};
      params[field] = order;
      return params;
    };

    // Fonction pour charger les transactions
    const loadTransactions = useCallback(
      (
        isRefresh: boolean = false,
        currentCursor: string | null = null,
        currentSort?: { field: SortField | null; order: "asc" | "desc" },
      ) => {
        if (!companyId) return;

        const sort = currentSort || { field: sortField, order: sortOrder };

        const params: GetTransactionsParams = {
          companyId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          categoryValue: category || undefined,
          movementValue: movement || undefined,
          paidForValue: paidFor || undefined,
          paymentModeValue: paymentMode || undefined,
          sourceValue: source || undefined,
          cursor: isRefresh ? undefined : currentCursor,
          take: 5, // Nombre d'éléments par page
          ...buildSortParams(sort.field || "byDate", sort.order),
        };

        mutateGetTransactions(params, {
          onSuccess(data) {
            if (data.data) {
              if (isRefresh) {
                setTransactions(data.data);
              } else {
                setTransactions((prev) => [...prev, ...(data?.data ?? [])]);
              }
              setCursor(data.nextCursor);
              setHasMore(!!data.nextCursor);
            }
          },
          onSettled() {
            setIsLoadingMore(false);
          },
        });
      },
      [
        companyId,
        startDate,
        endDate,
        category,
        movement,
        paidFor,
        paymentMode,
        source,
        sortField,
        sortOrder,
        mutateGetTransactions,
      ],
    );

    // Fonction de rafraîchissement
    const refreshTransaction = useCallback(() => {
      setCursor(null);
      setHasMore(true);
      loadTransactions(true);
    }, [loadTransactions]);

    // Fonction pour charger plus de données (scroll infini)
    const loadMore = useCallback(() => {
      if (hasMore && !isGettingTransactions && !isLoadingMore && cursor) {
        setIsLoadingMore(true);
        loadTransactions(false, cursor);
      }
    }, [
      hasMore,
      isGettingTransactions,
      isLoadingMore,
      cursor,
      loadTransactions,
    ]);

    // Fonction de tri
    const handleSort = useCallback(
      (field: SortField) => {
        let newOrder: "asc" | "desc" = "asc";

        if (sortField === field) {
          newOrder = sortOrder === "asc" ? "desc" : "asc";
        }

        setSortField(field);
        setSortOrder(newOrder);
        setCursor(null);
        setHasMore(true);

        // Charger immédiatement avec le nouveau tri
        loadTransactions(true, null, { field, order: newOrder });
      },
      [sortField, sortOrder, loadTransactions],
    );

    // Fonction pour rendre les icônes de tri
    const renderSortIcon = (field: SortField) => {
      if (sortField !== field) {
        return <ChevronsUpDownIcon className="size-3.5" />;
      }
      return sortOrder === "asc" ? (
        <ChevronUpIcon className="size-3.5" />
      ) : (
        <ChevronDownIcon className="size-3.5" />
      );
    };

    // Fonction de gestion du scroll
    const handleScroll = useCallback(() => {
      if (!tableContainerRef.current) return;

      // Chercher le conteneur ScrollArea
      const scrollArea = tableContainerRef.current.closest(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement;

      if (scrollArea) {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea;

        // Déclencher le chargement quand on est proche du bas (100px avant)
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          loadMore();
        }
      } else {
        // Fallback: utiliser le scroll de window si ScrollArea non trouvé
        if (
          window.innerHeight + document.documentElement.scrollTop + 100 >=
          document.documentElement.offsetHeight
        ) {
          loadMore();
        }
      }
    }, [loadMore]);

    // Effect pour le scroll infini
    useEffect(() => {
      if (!tableContainerRef.current) return;

      // Chercher le conteneur ScrollArea
      const scrollArea = tableContainerRef.current.closest(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement;

      if (scrollArea) {
        scrollArea.addEventListener("scroll", handleScroll);
        return () => scrollArea.removeEventListener("scroll", handleScroll);
      } else {
        // Fallback: écouter le scroll de window
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }
    }, [handleScroll]);

    // Effect pour les changements de filtres
    useEffect(() => {
      refreshTransaction();
    }, [startDate, endDate, category, movement, paymentMode, source, paidFor]);

    // Fonction pour vérifier si on peut scroller
    const checkIfScrollable = useCallback(() => {
      if (!tableContainerRef.current) return false;

      const scrollArea = tableContainerRef.current.closest(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement;

      if (scrollArea) {
        return scrollArea.scrollHeight > scrollArea.clientHeight;
      }
      return document.documentElement.scrollHeight > window.innerHeight;
    }, []);

    // Fonction pour charger jusqu'à ce que le conteneur soit scrollable
    const ensureScrollable = useCallback(() => {
      if (!hasMore || isGettingTransactions || isLoadingMore || !cursor) return;

      // Attendre un court délai pour que le DOM soit mis à jour
      setTimeout(() => {
        if (!checkIfScrollable()) {
          setIsLoadingMore(true);
          loadTransactions(false, cursor);
        }
      }, 100);
    }, [
      hasMore,
      isGettingTransactions,
      isLoadingMore,
      cursor,
      checkIfScrollable,
      loadTransactions,
    ]);

    // Effect pour vérifier si on peut scroller après chaque chargement
    useEffect(() => {
      if (transactions.length > 0 && !isGettingTransactions && !isLoadingMore) {
        ensureScrollable();
      }
    }, [transactions, isGettingTransactions, isLoadingMore, ensureScrollable]);

    // Effect initial
    useEffect(() => {
      if (companyId && transactions.length === 0) {
        loadTransactions(true);
      }
    }, [companyId]);

    useImperativeHandle(ref, () => ({
      refreshTransaction,
    }));

    function getPaymentMode(value: string) {
      return acceptPayment.find(accept => accept.value === value)?.label;
    }

    const isSelected = (id: string) => selectedTransactionIds.some(transac => transac.id === id);

    return (
      <div
        ref={tableContainerRef}
        className="border border-neutral-200 rounded-xl"
      >
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byDate")}
                >
                  Date
                  <span className="text-neutral-400">
                    {renderSortIcon("byDate")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byMovement")}
                >
                  Mouvement
                  <span className="text-neutral-400">
                    {renderSortIcon("byMovement")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byCategory")}
                >
                  Catégorie
                  <span className="text-neutral-400">
                    {renderSortIcon("byCategory")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byNature")}
                >
                  Nature
                  <span className="text-neutral-400">
                    {renderSortIcon("byNature")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byDescription")}
                >
                  Description
                  <span className="text-neutral-400">
                    {renderSortIcon("byDescription")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byAmount")}
                >
                  HT Montant
                  <span className="text-neutral-400">
                    {renderSortIcon("byAmount")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byAmount")}
                >
                  TTC Montant
                  <span className="text-neutral-400">
                    {renderSortIcon("byAmount")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byPaymentMode")}
                >
                  Mode de paiement
                  <span className="text-neutral-400">
                    {renderSortIcon("byPaymentMode")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                Numéro de chèque
              </TableHead>
              <TableHead className="font-medium text-center">
                Référence du document
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byAllocation")}
                >
                  Allocation
                  <span className="text-neutral-400">
                    {renderSortIcon("byAllocation")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("bySource")}
                >
                  Source
                  <span className="text-neutral-400">
                    {renderSortIcon("bySource")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                <span
                  className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort("byPaidOnBehalfOf")}
                >
                  Payé pour le compte de
                  <span className="text-neutral-400">
                    {renderSortIcon("byPaidOnBehalfOf")}
                  </span>
                </span>
              </TableHead>
              <TableHead className="font-medium text-center">
                Payeur
              </TableHead>
              <TableHead className="font-medium text-center">
                Commentaire
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isGettingTransactions && transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              <>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className={`h-16 transition-colors ${isSelected(transaction.id) ? "bg-neutral-100" : ""
                      }`}
                  >
                    <TableCell className="text-neutral-600">
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={isSelected(transaction.id)}
                          onCheckedChange={(checked) =>
                            toggleSelection(transaction.id, !!checked, transaction.type)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {formatDateToDashModel(new Date(transaction.date))}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.movement === "INFLOWS" ? "Entrée" : "Sortie"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.category.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.nature.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.amountType === "HT"
                        ? `${formatNumber(transaction.amount)} ${currency}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.amountType === "TTC"
                        ? `${formatNumber(transaction.amount)} ${currency}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPaymentMode(transaction.paymentType)}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.checkNumber || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.documentReference}
                      {/* {getDocumentRef(transaction)} */}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.allocation?.name || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.source?.name || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.payOnBehalfOf
                        ? cutText(
                          `${transaction.payOnBehalfOf.lastname} ${transaction.payOnBehalfOf.firstname}`,
                        )
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.client ? `${transaction.client.lastname} ${transaction.client.firstname}` :
                        transaction.supplier ? `${transaction.supplier.lastname} ${transaction.supplier.firstname}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.comment || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {isLoadingMore && (
                  <TableRow>
                    <TableCell colSpan={15}>
                      <div className="flex justify-center items-center py-4 w-full">
                        <Spinner />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={15}
                  className="py-6 text-gray-500 text-sm text-center"
                >
                  Aucune transaction trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  },
);

TransactionTable.displayName = "TransactionTable";

export default TransactionTable;
