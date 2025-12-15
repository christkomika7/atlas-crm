"use client";

import { Combobox } from "@/components/ui/combobox";
import { periods, reportTypes } from "@/lib/data";
import { useEffect, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { RequestResponse } from "@/types/api.types";
import { useDataStore } from "@/stores/data.store";
import {
  ReportType,
  SalesByClientItem,
  SalesByItemItem,
  SalesByBillboardItem,
  PaymentsByDateItem,
  PaymentsByTypeItem,
  PaymentsByClientItem,
  ExpensesByCategoryItem,
  ExpensesJournalItem,
  DebtorAccountAgingItem,
  PeriodType,
} from "@/types/company.types";
import { useAccess } from "@/hook/useAccess";
import useQueryAction from "@/hook/useQueryAction";
import AccessContainer from "@/components/errors/access-container";
import ReportData from "./report-data";
import {
  getSalesByClient,
  getSalesByItem,
  getSalesByBillboards,
  getPaymentsByDate,
  getPaymentsByType,
  getPaymentsByClients,
  getExpensesByCategories,
  getExpensesJournal,
  getDebtorAccountAging,
} from "@/action/company.action";
import ExportButton from "../export-button";

export default function ExportTab() {
  const companyId = useDataStore.use.currentCompany();
  const currency = useDataStore.use.currency();

  const [filters, setFilters] = useState<{
    reportType: ReportType;
    period: PeriodType | "";
    start?: Date;
    end?: Date;
  }>({
    reportType: "salesByClient",
    period: "",
    start: undefined,
    end: undefined,
  });

  const [datas, setDatas] = useState<
    | SalesByClientItem[]
    | SalesByItemItem[]
    | SalesByBillboardItem[]
    | PaymentsByDateItem[]
    | PaymentsByTypeItem[]
    | PaymentsByClientItem[]
    | ExpensesByCategoryItem[]
    | ExpensesJournalItem[]
    | DebtorAccountAgingItem[]
  >([]);
  const [ready, setReady] = useState(false);

  const { access: readAccess, loading } = useAccess("SETTING", "READ");

  const { mutate: mutateSalesByClient, isPending: isLoadingSalesByClient } =
    useQueryAction<
      { companyId: string; period?: PeriodType; start?: Date; end?: Date },
      RequestResponse<SalesByClientItem[]>
    >(getSalesByClient, () => { }, "salesByClient");

  const { mutate: mutateSalesByItem, isPending: isLoadingSalesByItem } =
    useQueryAction<
      { companyId: string; period?: PeriodType; start?: Date; end?: Date },
      RequestResponse<SalesByItemItem[]>
    >(getSalesByItem, () => { }, "salesByItem");

  const {
    mutate: mutateSalesByBillboards,
    isPending: isLoadingSalesByBillboards,
  } = useQueryAction<
    { companyId: string; period?: PeriodType; start?: Date; end?: Date },
    RequestResponse<SalesByBillboardItem[]>
  >(getSalesByBillboards, () => { }, "salesByBillboards");

  const { mutate: mutatePaymentsByDate, isPending: isLoadingPaymentsByDate } =
    useQueryAction<
      { companyId: string; period?: PeriodType; start?: Date; end?: Date },
      RequestResponse<PaymentsByDateItem[]>
    >(getPaymentsByDate, () => { }, "paymentsByDate");

  const { mutate: mutatePaymentsByType, isPending: isLoadingPaymentsByType } =
    useQueryAction<
      { companyId: string; period?: PeriodType; start?: Date; end?: Date },
      RequestResponse<PaymentsByTypeItem[]>
    >(getPaymentsByType, () => { }, "paymentsByType");

  const {
    mutate: mutatePaymentsByClients,
    isPending: isLoadingPaymentsByClients,
  } = useQueryAction<
    { companyId: string; period?: PeriodType; start?: Date; end?: Date },
    RequestResponse<PaymentsByClientItem[]>
  >(getPaymentsByClients, () => { }, "paymentsByClients");

  const {
    mutate: mutateExpensesByCategories,
    isPending: isLoadingExpensesByCategories,
  } = useQueryAction<
    { companyId: string; period?: PeriodType; start?: Date; end?: Date },
    RequestResponse<ExpensesByCategoryItem[]>
  >(getExpensesByCategories, () => { }, "expensesByCategories");

  const {
    mutate: mutateExpensesJournal,
    isPending: isLoadingExpensesJournal,
  } = useQueryAction<
    { companyId: string; period?: PeriodType; start?: Date; end?: Date },
    RequestResponse<ExpensesJournalItem[]>
  >(getExpensesJournal, () => { }, "expensesJournal");

  const {
    mutate: mutateDebtorAccountAging,
    isPending: isLoadingDebtorAccountAging,
  } = useQueryAction<
    { companyId: string; period?: PeriodType; start?: Date; end?: Date },
    RequestResponse<DebtorAccountAgingItem[]>
  >(getDebtorAccountAging, () => { }, "debtorAccountAging");

  const loadReportData = () => {
    if (!companyId || !readAccess) return;

    setReady(false);
    setDatas([]);

    const params = {
      companyId,
      period: filters.period || undefined,
      start: filters.start,
      end: filters.end,
    };

    const onSuccess = (res: RequestResponse<any>) => {
      setDatas(res.data ?? []);
      setReady(true);
    };

    const onError = () => {
      setDatas([]);
      setReady(true);
    };

    switch (filters.reportType) {
      case "salesByClient":
        mutateSalesByClient(params, { onSuccess, onError });
        break;
      case "salesByItem":
        mutateSalesByItem(params, { onSuccess, onError });
        break;
      case "salesByBillboards":
        mutateSalesByBillboards(params, { onSuccess, onError });
        break;
      case "paymentsByDate":
        mutatePaymentsByDate(params, { onSuccess, onError });
        break;
      case "paymentsByType":
        mutatePaymentsByType(params, { onSuccess, onError });
        break;
      case "paymentsByClients":
        mutatePaymentsByClients(params, { onSuccess, onError });
        break;
      case "expensesByCategories":
        mutateExpensesByCategories(params, { onSuccess, onError });
        break;
      case "expensesJournal":
        mutateExpensesJournal(params, { onSuccess, onError });
        break;
      case "debtorAccountAging":
        mutateDebtorAccountAging(params, { onSuccess, onError });
        break;
    }
  };

  useEffect(() => {
    loadReportData();
  }, [companyId, readAccess, filters]);

  const isLoading =
    isLoadingSalesByClient ||
    isLoadingSalesByItem ||
    isLoadingSalesByBillboards ||
    isLoadingPaymentsByDate ||
    isLoadingPaymentsByType ||
    isLoadingPaymentsByClients ||
    isLoadingExpensesByCategories ||
    isLoadingExpensesJournal ||
    isLoadingDebtorAccountAging;

  return (
    <AccessContainer hasAccess={readAccess} resource="SETTING" loading={loading}>
      <div className="space-y-4 pt-4">
        <div className="flex gap-2 flex-wrap justify-between items-center">
          <div className="flex flex-wrap gap-2">
            <Combobox
              className="w-[300px]"
              datas={reportTypes}
              value={filters.reportType}
              setValue={(e) =>
                setFilters((p) => ({ ...p, reportType: e as ReportType }))
              }
              placeholder="Type de rapport"
              searchMessage="Rechercher un type de rapport"
              noResultsMessage="Aucun type de rapport trouvé."
            />

            <Combobox
              className="w-[220px]"
              required={false}
              datas={periods}
              value={filters.period}
              setValue={(e) =>
                setFilters((p) => ({ ...p, period: e as PeriodType | "" }))
              }
              placeholder="Période"
              searchMessage="Rechercher une période"
              noResultsMessage="Aucune période trouvée."
            />

            <DatePicker
              className="w-[160px]"
              label="Date de début"
              required={false}
              mode="single"
              value={filters.start}
              onChange={(date) =>
                setFilters((p) => ({ ...p, start: date as Date }))
              }
            />

            <DatePicker
              className="w-[160px]"
              label="Date de fin"
              required={false}
              mode="single"
              value={filters.end}
              onChange={(date) =>
                setFilters((p) => ({ ...p, end: date as Date }))
              }
            />
          </div>
          <ExportButton
            report={filters.reportType}
            datas={datas}
            isLoading={isLoading}
            ready={ready}
          />
        </div>

        <ReportData
          report={filters.reportType}
          datas={datas}
          currency={currency}
          isLoading={isLoading}
          ready={ready}
        />
      </div>
    </AccessContainer>
  );
}