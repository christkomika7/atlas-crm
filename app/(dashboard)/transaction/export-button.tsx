import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatNumber, getPaymentModeLabel } from '@/lib/utils';
import { formatDateToDashModel, period } from '@/lib/date';
import { useState } from 'react';
import { useDataStore } from '@/stores/data.store';
import { TransactionType } from '@/types/transaction.type';
import { exportToDocument } from '@/action/transaction.action';

import Spinner from '@/components/ui/spinner';
import Papa from 'papaparse';
import useQueryAction from '@/hook/useQueryAction';

type ExportButtonProps = {
    transactions: TransactionType[];
    isLoading: boolean;
}

export default function ExportButton({ transactions, isLoading }: ExportButtonProps) {
    const companyId = useDataStore.use.currentCompany();
    const currency = useDataStore.use.currency();
    const [isLoadingCsv, setIsloadingCsv] = useState(false);
    const [doc, setDoc] = useState<"word" | "excel">();

    const { mutate: mutate, isPending } =
        useQueryAction<
            {
                datas: TransactionType[]
                companyId: string;
                doc: "excel" | "word"
            },
            {
                status: string;
                message: string;
            }
        >(exportToDocument, () => { }, "export");


    function toCsv(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        if (!transactions || transactions.length === 0) return;

        setIsloadingCsv(true);

        const columns = [
            "Date",
            "Mouvement",
            "Catégorie",
            "Nature",
            "Description",
            "HT Montant",
            "TTC Montant",
            "Mode de paiement",
            "Numéro de chèque",
            "Référence du document",
            "Allocation",
            "Source",
            "Période",
            "Payé pour le compte de",
            "Payeur",
            "Commentaire",
        ];

        const csvData = transactions.map((transaction) => ({
            Date: formatDateToDashModel(new Date(transaction.date)),
            Mouvement: transaction.movement === "INFLOWS" ? "Entrée" : "Sortie",
            Catégorie: transaction.category?.name || "-",
            Nature: transaction.nature?.name || "-",
            Description: transaction.description || "-",
            "HT Montant":
                transaction.amountType === "HT"
                    ? `${formatNumber(transaction.amount)} ${currency}`
                    : "-",
            "TTC Montant":
                transaction.amountType === "TTC"
                    ? `${formatNumber(transaction.amount)} ${currency}`
                    : "-",
            "Mode de paiement": getPaymentModeLabel(transaction.paymentType),
            "Numéro de chèque": transaction.checkNumber || "-",
            "Référence du document": transaction.documentReference || "-",
            Allocation: transaction.allocation?.name || "-",
            Source: transaction.source?.name || "-",
            Période: period(transaction.periodStart, transaction.periodEnd),
            "Payé pour le compte de": transaction.payOnBehalfOf
                ? `${transaction.payOnBehalfOf.lastname} ${transaction.payOnBehalfOf.firstname}`
                : "-",
            Payeur: transaction.client
                ? `${transaction.client.lastname} ${transaction.client.firstname}`
                : transaction.supplier
                    ? `${transaction.supplier.lastname} ${transaction.supplier.firstname}`
                    : "-",
            Commentaire: transaction.comment || "-",
        }));

        const csv = Papa.unparse({
            fields: columns,
            data: csvData,
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "transactions-export.csv");
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsloadingCsv(false);
    }


    function toDoc(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, doc: "excel" | "word") {

        e.preventDefault()
        setDoc(doc)
        mutate({ datas: transactions, companyId, doc }, {
            onSuccess(data, variables, context) {
                setDoc(undefined);
            },
        })
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="inset-primary">Exporter</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-1 w-[120px]">
                {isLoading ? <span className='p-2'><Spinner /> </span> :
                    <>
                        <Button
                            onClick={e => toDoc(e, "word")}
                            variant="primary"
                            className="bg-white hover:bg-blue gap-x-2 items-center justify-start shadow-none !h-10 text-black hover:text-white transition-[color,background-color,box-shadow]"
                        >
                            DOCX {(isPending && doc === 'word') && <Spinner size={14} />}
                        </Button>
                        <Button
                            onClick={e => toDoc(e, "excel")}
                            variant="primary"
                            className="bg-white hover:bg-blue gap-x-2 items-center justify-start shadow-none !h-10 text-black hover:text-white transition-[color,background-color,box-shadow]"
                        >
                            EXCEL {(isPending && doc === 'excel') && <Spinner size={14} />}
                        </Button>
                        <Button
                            onClick={toCsv}
                            variant="primary"
                            className="bg-white items-center hover:bg-blue gap-x-2 justify-start shadow-none !h-10 text-black hover:text-white transition-[color,background-color,box-shadow]"
                        >
                            CSV  {isLoadingCsv && <Spinner size={14} />}
                        </Button>
                    </>
                }
            </PopoverContent>
        </Popover>
    )
}
