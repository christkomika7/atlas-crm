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
import { formatDateToDashModel, period } from "@/lib/date";
import { cutText, formatNumber, getPaymentModeLabel } from "@/lib/utils";
import Spinner from "@/components/ui/spinner";
import { $Enums } from "@/lib/generated/prisma";
import Paginations from "@/components/paginations";
import { DEFAULT_PAGE_SIZE } from "@/config/constant";
import { useAccess } from "@/hook/useAccess";
import AccessContainer from "@/components/errors/access-container";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TransactionTableProps = {
  selectedTransactionIds: DeletedTransactions[];
  setSelectedTransactionIds: Dispatch<SetStateAction<DeletedTransactions[]>>;
  setTransactions: Dispatch<SetStateAction<TransactionType[]>>;
  setIsPending: Dispatch<SetStateAction<boolean>>
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
  | "byPaymentMode"
  | "bySource"

const TransactionTable = forwardRef<TransactionTableRef, TransactionTableProps>(
  ({ selectedTransactionIds, setSelectedTransactionIds, setTransactions, setIsPending }, ref) => {
    const searchParams = useSearchParams();
    const currency = useDataStore.use.currency();
    const companyId = useDataStore.use.currentCompany();
    const [datas, setDatas] = useState<TransactionType[]>([])

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const category = searchParams.get("category");
    const nature = searchParams.get("nature");
    const movement = searchParams.get("movement");
    const paymentMode = searchParams.get("paymentMode");
    const source = searchParams.get("source");

    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(DEFAULT_PAGE_SIZE);
    const [sortField, setSortField] = useState<SortField>("byDate");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isLoading, setIsLoading] = useState(false);

    const { access: readAccess, loading } = useAccess("TRANSACTION", "READ");

    const { mutate: mutateGetTransactions } = useQueryAction<
      GetTransactionsParams,
      { data: TransactionType[]; total: number, all: TransactionType[] }
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
        if (!companyId && !readAccess) return;
        setIsLoading(true);
        setIsPending(true)

        const params: GetTransactionsParams = {
          companyId,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          categoryValue: category ? category.split(",") : [],
          movementValue: movement ? movement.split(",") : [],
          natureValue: nature ? nature.split(",") : [],
          paymentModeValue: paymentMode ? paymentMode.split(",") : [],
          sourceValue: source ? source.split(",") : [],
          skip: (page - 1) * pageSize,
          take: pageSize,
          ...buildSortParams(sortField, sortOrder),
        };

        mutateGetTransactions(params, {
          onSuccess(data) {
            setDatas(data.data);
            setTotalItems(data.total);
            setTransactions(data.all)
            setIsPending(false)
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
        nature,
        paymentMode,
        source,
        pageSize,
        sortField,
        sortOrder,
        mutateGetTransactions,
        readAccess,
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
    }, [companyId, currentPage, sortField, sortOrder, startDate, endDate, category, movement, paymentMode, source, loadTransactions, readAccess]);

    const isSelected = (id: string) =>
      selectedTransactionIds.some((transac) => transac.id === id);

    return (
      <AccessContainer hasAccess={readAccess} resource="TRANSACTION" loading={loading} >
        <div className="border border-neutral-200 rounded-xl flex flex-col justify-between h-full">
          <Table>
            <TableHeader>
              <TableRow className="h-14">
                <TableHead className="min-w-12.5 font-medium" />
                {[
                  { label: "Date", field: "byDate" },
                  { label: "Mouvement", field: "byMovement" },
                  { label: "Catégorie", field: "byCategory" },
                  { label: "Nature", field: "byNature" },
                  { label: "HT Montant", field: null },
                  { label: "TTC Montant", field: null },
                  { label: "Mode de paiement", field: null },
                  { label: "Numéro de chèque", field: null },
                  { label: "Client | Fournisseurs tiers", field: null },
                  { label: "Référence du document", field: null },
                  { label: "Source", field: null },
                  { label: "Période", field: null },
                  { label: "Infos", field: null },
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
              ) : datas.length > 0 ? (
                datas.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className={`h-16 transition-colors ${isSelected(transaction.id) ? "bg-neutral-100" : ""}`}
                  ><TableCell className="text-center">
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
                    <TableCell className="text-center">
                      {transaction.amountType === "HT" ? `${formatNumber(transaction.amount)} ${currency}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.amountType === "TTC" ? `${formatNumber(transaction.amount)} ${currency}` : "-"}
                    </TableCell>
                    <TableCell className="text-center">{getPaymentModeLabel(transaction.paymentType)}</TableCell>
                    <TableCell className="text-center">{transaction.checkNumber || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer">
                            {cutText(transaction.clientOrSupplier
                            )}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {transaction.clientOrSupplier}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="text-center">{transaction.documentReference}</TableCell>
                    <TableCell className="text-center">{transaction.source?.name || "-"}</TableCell>
                    <TableCell className="text-center">
                      {transaction.period || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer">
                            {cutText(transaction.infos || "-", 20)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {transaction.infos || "-"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
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
      </AccessContainer >
    );
  }
);

TransactionTable.displayName = "TransactionTable";

export default TransactionTable;
