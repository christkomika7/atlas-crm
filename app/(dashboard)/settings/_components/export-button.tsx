import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Spinner from '@/components/ui/spinner';
import Papa from 'papaparse';
import {
    DebtorAccountAgingItem, ExpensesByCategoryItem, ExpensesJournalItem,
    PaymentsByClientItem, PaymentsByDateItem, PaymentsByTypeItem,
    ReportType, SalesByBillboardItem, SalesByClientItem, SalesByItemItem
} from '@/types/company.types';
import { formatNumber } from '@/lib/utils';
import { formatDateToDashModel } from '@/lib/date';
import useQueryAction from '@/hook/useQueryAction';
import { exportToPdf } from '@/action/company.action';
import { useState } from 'react';

type ExportButtonProps = {
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
    report: ReportType;
    isLoading: boolean;
    ready: boolean;
}

export default function ExportButton({ datas, isLoading, ready, report }: ExportButtonProps) {
    const [isLoadingCsv, setIsloadingCsv] = useState(false);
    const { mutate: mutate, isPending } =
        useQueryAction<
            {
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
                report: ReportType
            },
            {
                status: string;
                message: string;
            }
        >(exportToPdf, () => { }, "export");


    function toCsv(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        if (!datas || datas.length === 0) return;
        setIsloadingCsv(true);

        let csvData: any[] = [];
        let columns: string[] = [];

        switch (report) {
            case 'salesByClient':
                columns = ['Date', 'Client', 'Nombre de factures', 'Montant généré', 'Total payé', 'Dû'];
                csvData = (datas as SalesByClientItem[]).map(d => ({
                    Date: formatDateToDashModel(d.date),
                    Client: d.name,
                    'Nombre de factures': d.count,
                    'Montant généré': formatNumber(d.totalGenerated || 0),
                    'Total payé': formatNumber(d.totalPaid || 0),
                    Dû: formatNumber(d.totalRemaining || 0),
                }));
                break;

            case 'salesByBillboards':
                columns = ['Date', 'Panneau', 'Modèle', 'Nombre de facture', 'Montant généré', 'Total payé', 'Due'];
                csvData = (datas as SalesByBillboardItem[]).map(d => ({
                    Date: formatDateToDashModel(d.date),
                    Panneau: d.name,
                    Modèle: d.type,
                    'Nombre de facture': d.count,
                    'Montant généré': formatNumber(d.totalGenerated || 0),
                    'Total payé': formatNumber(d.totalPaid || 0),
                    Due: formatNumber(d.totalRemaining || 0),
                }));
                break;

            case 'salesByItem':
                columns = ['Date', 'Produit | Service', 'Nombre de facture', 'Montant généré', 'Total payé', 'Due'];
                csvData = (datas as SalesByItemItem[]).map(d => ({
                    Date: formatDateToDashModel(d.date),
                    'Produit | Service': d.name,
                    'Nombre de facture': d.count,
                    'Montant généré': formatNumber(d.totalGenerated || 0),
                    'Total payé': formatNumber(d.totalPaid || 0),
                    Due: formatNumber(d.totalRemaining || 0),
                }));
                break;

            case 'paymentsByType':
                columns = ['Date', 'Source', 'Montant'];
                csvData = (datas as PaymentsByTypeItem[]).map(d => ({
                    Date: formatDateToDashModel(d.date),
                    Source: d.source,
                    Montant: formatNumber(d.amount || 0),
                }));
                break;

            case 'paymentsByClients':
                columns = ['Client', 'Nombre d\'encaissement', 'Total payé'];
                csvData = (datas as PaymentsByClientItem[]).map(d => ({
                    Client: d.client,
                    'Nombre d\'encaissement': d.count,
                    'Total payé': formatNumber(d.totalPaid || 0),
                }));
                break;

            case 'expensesJournal':
                columns = ['Date', 'Source', 'Montant'];
                csvData = (datas as ExpensesJournalItem[]).map(d => ({
                    Date: formatDateToDashModel(d.date),
                    Source: d.source,
                    Montant: formatNumber(d.amount || 0),
                }));
                break;

            case 'expensesByCategories':
                columns = ['Date', 'Catégorie', 'Montant total'];
                csvData = (datas as ExpensesByCategoryItem[]).map(d => ({
                    Date: formatDateToDashModel(d.date),
                    Catégorie: d.category,
                    'Montant total': formatNumber(d.totalAmount || 0),
                }));
                break;

            case 'debtorAccountAging':
                columns = ['Client', 'Total dû', 'Payable aujourd\'hui', '1-30 jours', '31-60 jours', '61-90 jours', '91+ jours'];
                csvData = (datas as DebtorAccountAgingItem[]).map(d => ({
                    Client: d.client,
                    'Total dû': formatNumber(d.totalDue || 0),
                    'Payable aujourd\'hui': formatNumber(d.payableToday || 0),
                    '1-30 jours': formatNumber(d.delay1to30 || 0),
                    '31-60 jours': formatNumber(d.delay31to60 || 0),
                    '61-90 jours': formatNumber(d.delay61to90 || 0),
                    '91+ jours': formatNumber(d.delayOver91 || 0),
                }));
                break;

            case 'paymentsByDate':
                columns = ['Date', 'Client', 'Montant encaissé'];
                csvData = (datas as PaymentsByDateItem[]).map(d => ({
                    Date: formatDateToDashModel(d.date),
                    Client: d.client === "-" ? "Inconnu" : d.client,
                    'Montant encaissé': formatNumber(d.amount || 0),
                }));
                break;

            default:
                csvData = datas as any[];
        }

        const csv = Papa.unparse({
            fields: columns,
            data: csvData
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${report}-export.csv`);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsloadingCsv(false);
    }


    function toPdf(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault()
        mutate({ datas, report })
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="inset-primary" className="max-w-[120px] !h-11">
                    Exporter
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-1 w-[120px]">
                {(!ready || isLoading) ? <span className='p-2'><Spinner /> </span> :
                    <>
                        <Button
                            onClick={toPdf}
                            variant="primary"
                            className="bg-white hover:bg-blue justify-start shadow-none !h-10 text-black hover:text-white transition-[color,background-color,box-shadow]"
                        >
                            {isPending ? <Spinner /> : 'PDF'}
                        </Button>
                        <Button
                            onClick={toCsv}
                            variant="primary"
                            className="bg-white hover:bg-blue justify-start shadow-none !h-10 text-black hover:text-white transition-[color,background-color,box-shadow]"
                        >
                            {isLoadingCsv ? <Spinner /> : 'CSV'}
                        </Button>
                    </>
                }
            </PopoverContent>
        </Popover>
    )
}
