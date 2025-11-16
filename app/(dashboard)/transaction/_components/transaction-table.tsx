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
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
} from "react";
import useQueryAction from "@/hook/useQueryAction";
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
import { formatDateToDashModel, getMonthsAndDaysDifference } from "@/lib/date";
import { cutText, formatNumber } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import { $Enums } from "@/lib/generated/prisma";
import { acceptPayment } from "@/lib/data";
import Paginations from "@/components/paginations";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";

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
    const currency = useDataStore.use.currency();
    const companyId = useDataStore.use.currentCompany();

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const movement = searchParams.get("movement");
    const paymentMode = searchParams.get("paymentMode");
    const source = searchParams.get("source");
    const paidFor = searchParams.get("paidFor");

    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(DEFAULT_PAGE_SIZE);
    const [sortField, setSortField] = useState<SortField>("byDate");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isLoading, setIsLoading] = useState(false);

    const { mutate: mutateGetTransactions } = useQueryAction<
      GetTransactionsParams,
      { data: TransactionType[]; total: number }
    >(getTransactions, () => { }, "transactions");

    const toggleSelection = (transactionId: string, checked: boolean, transactionType: $Enums.TransactionType) => {
      setSelectedTransactionIds((prev) =>
        checked
          ? [...prev, { id: transactionId, transactionType }]
          : prev.filter((transac) => transac.id !== transactionId)
      );
    };

    const buildSortParams = (field: SortField, order: "asc" | "desc") => ({
      [field]: order,
    });

    const loadTransactions = useCallback(
      (page: number) => {
        if (!companyId) return;
        setIsLoading(true);

        const params: GetTransactionsParams = {
          companyId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          categoryValue: category || undefined,
          movementValue: movement || undefined,
          paidForValue: paidFor || undefined,
          paymentModeValue: paymentMode || undefined,
          sourceValue: source || undefined,
          skip: (page - 1) * pageSize,
          take: pageSize,
          ...buildSortParams(sortField, sortOrder),
        };

        mutateGetTransactions(params, {
          onSuccess(data) {
            setTransactions(data.data);
            setTotalItems(data.total);
          },
          onSettled() {
            setIsLoading(false);
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
        pageSize,
        sortField,
        sortOrder,
        mutateGetTransactions,
      ]
    );

    const handleSort = useCallback(
      (field: SortField) => {
        let newOrder: "asc" | "desc" = "asc";
        if (sortField === field) newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(newOrder);
        setCurrentPage(1);
      },
      [sortField, sortOrder]
    );

    const renderSortIcon = (field: SortField) => {
      if (sortField !== field) return <ChevronsUpDownIcon className="size-3.5" />;
      return sortOrder === "asc" ? <ChevronUpIcon className="size-3.5" /> : <ChevronDownIcon className="size-3.5" />;
    };

    useImperativeHandle(ref, () => ({
      refreshTransaction: () => loadTransactions(currentPage),
    }));

    useEffect(() => {
      loadTransactions(currentPage);
    }, [companyId, currentPage, sortField, sortOrder, startDate, endDate, category, movement, paymentMode, source, paidFor, loadTransactions]);

    const getPaymentModeLabel = (value: string) =>
      acceptPayment.find((accept) => accept.value === value)?.label || "-";

    const isSelected = (id: string) =>
      selectedTransactionIds.some((transac) => transac.id === id);

    const period = (start: Date | null, end: Date | null) => {
      if (start && end) {
        return getMonthsAndDaysDifference(start, end);
      }
      return "-"

    }

    return (
      <div className="border border-neutral-200 rounded-xl flex flex-col justify-between h-full">
        <Table>
          <TableHeader>
            <TableRow className="h-14">
              <TableHead className="min-w-[50px] font-medium" />
              {[
                { label: "Date", field: "byDate" },
                { label: "Mouvement", field: "byMovement" },
                { label: "Catégorie", field: "byCategory" },
                { label: "Nature", field: "byNature" },
                { label: "Description", field: null },
                { label: "HT Montant", field: null },
                { label: "TTC Montant", field: null },
                { label: "Mode de paiement", field: null },
                { label: "Numéro de chèque", field: null },
                { label: "Référence du document", field: null },
                { label: "Allocation", field: null },
                { label: "Source", field: null },
                { label: "Période", field: null },
                { label: "Payé pour le compte de", field: null },
                { label: "Payeur", field: null },
                { label: "Commentaire", field: null },
              ].map((col, idx) => (
                <TableHead key={idx} className="font-medium text-center">
                  {col.field ? (
                    <span
                      className="flex items-center justify-center gap-x-1 cursor-pointer hover:text-blue-600"
                      onClick={() => handleSort(col.field as SortField)}
                    >
                      {col.label}
                      <span className="text-neutral-400">{renderSortIcon(col.field as SortField)}</span>
                    </span>
                  ) : (
                    col.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={15}>
                  <div className="flex justify-center items-center py-6 w-full">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className={`h-16 transition-colors ${isSelected(transaction.id) ? "bg-neutral-100" : ""
                    }`}
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isSelected(transaction.id)}
                      onCheckedChange={(checked) =>
                        toggleSelection(transaction.id, !!checked, transaction.type)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDateToDashModel(new Date(transaction.date))}
                  </TableCell>
                  <TableCell className="text-center">
                    {transaction.movement === "INFLOWS" ? "Entrée" : "Sortie"}
                  </TableCell>
                  <TableCell className="text-center">{transaction.category.name}</TableCell>
                  <TableCell className="text-center">{transaction.nature.name}</TableCell>
                  <TableCell className="text-center">{transaction.description || "-"}</TableCell>
                  <TableCell className="text-center">
                    {transaction.amountType === "HT" ? `${formatNumber(transaction.amount)} ${currency}` : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {transaction.amountType === "TTC" ? `${formatNumber(transaction.amount)} ${currency}` : "-"}
                  </TableCell>
                  <TableCell className="text-center">{getPaymentModeLabel(transaction.paymentType)}</TableCell>
                  <TableCell className="text-center">{transaction.checkNumber || "-"}</TableCell>
                  <TableCell className="text-center">{transaction.documentReference}</TableCell>
                  <TableCell className="text-center">{transaction.allocation?.name || "-"}</TableCell>
                  <TableCell className="text-center">{transaction.source?.name || "-"}</TableCell>
                  <TableCell className="text-center">{period(transaction.periodStart, transaction.periodEnd)}</TableCell>

                  <TableCell className="text-center">
                    {transaction.payOnBehalfOf
                      ? cutText(`${transaction.payOnBehalfOf.lastname} ${transaction.payOnBehalfOf.firstname}`)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {transaction.client
                      ? `${transaction.client.lastname} ${transaction.client.firstname}`
                      : transaction.supplier
                        ? `${transaction.supplier.lastname} ${transaction.supplier.firstname}`
                        : "-"}
                  </TableCell>
                  <TableCell className="text-center">{transaction.comment || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} className="py-6 text-gray-500 text-sm text-center">
                  Aucune transaction trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Paginations
          totalItems={totalItems}
          pageSize={pageSize}
          controlledPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          maxVisiblePages={DEFAULT_PAGE_SIZE}
        />
      </div>
    );
  }
);

TransactionTable.displayName = "TransactionTable";

export default TransactionTable;
