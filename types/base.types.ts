export type BaseType = {
    id: string;
    name: string;
}

export type ReportType = 'salesByClient' | 'salesByItem' | 'salesByBillboards' |
    'paymentsByDate' | 'paymentsByClients' | 'paymentsByType' | 'expensesByCategories' |
    'expensesJournal' | 'debtorAccountAging';
