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
} from "@/types/company.types";

import SellClient from "../export-tab/sell-client";
import SellArticle from "../export-tab/sell-article";
import BuyDate from "../export-tab/buy-date";
import SellBillboard from "../export-tab/sell-billboard";
import Spinner from "@/components/ui/spinner";
import PaymentsByType from "../export-tab/payments-by-type";
import PaymentsByClient from "../export-tab/payments-by-client";
import ExpensesByCategories from "../export-tab/expenses-by-categories";
import ExpensesJournal from "../export-tab/expenses-journal";
import DebtorAccountAging from "../export-tab/debtor-account-aging";

type ReportDataProps = {
    report: ReportType;
    isLoading: boolean;
    ready: boolean;
    datas:
    | SalesByClientItem[]
    | SalesByItemItem[]
    | SalesByBillboardItem[]
    | PaymentsByDateItem[]
    | PaymentsByTypeItem[]
    | PaymentsByClientItem[]
    | ExpensesByCategoryItem[]
    | ExpensesJournalItem[]
    | DebtorAccountAgingItem[];
    currency: string;
};

export default function ReportData({
    report,
    isLoading,
    datas,
    currency,
    ready,
}: ReportDataProps) {
    if ((!ready || isLoading) && (!datas || datas.length === 0)) {
        return <Spinner />;
    }


    switch (report) {
        case "salesByClient":
            return (
                <SellClient
                    isLoading={isLoading}
                    datas={datas as SalesByClientItem[]}
                    currency={currency}
                />
            );

        case "salesByItem":
            return (
                <SellArticle
                    isLoading={isLoading}
                    datas={datas as SalesByItemItem[]}
                    currency={currency}
                />
            );

        case "salesByBillboards":
            return (
                <SellBillboard
                    isLoading={isLoading}
                    datas={datas as SalesByBillboardItem[]}
                    currency={currency}
                />
            );

        case "paymentsByDate":
            return (
                <BuyDate
                    isLoading={isLoading}
                    datas={datas as PaymentsByDateItem[]}
                    currency={currency}
                />
            );

        case "paymentsByType":
            return (
                <PaymentsByType
                    isLoading={isLoading}
                    datas={datas as PaymentsByTypeItem[]}
                    currency={currency}
                />
            );

        case "paymentsByClients":
            return (
                <PaymentsByClient
                    isLoading={isLoading}
                    datas={datas as PaymentsByClientItem[]}
                    currency={currency}
                />
            );

        case "expensesByCategories":
            return (
                <ExpensesByCategories
                    isLoading={isLoading}
                    datas={datas as ExpensesByCategoryItem[]}
                    currency={currency}
                />
            );

        case "expensesJournal":
            return (
                <ExpensesJournal
                    isLoading={isLoading}
                    datas={datas as ExpensesJournalItem[]}
                    currency={currency}
                />
            );

        case "debtorAccountAging":
            return (
                <DebtorAccountAging
                    isLoading={isLoading}
                    datas={datas as DebtorAccountAgingItem[]}
                    currency={currency}
                />
            );

        default:
            return (
                <div className="h-40 flex items-center justify-center text-muted-foreground">
                    Type de rapport non pris en charge
                </div>
            );
    }
}