import Spinner from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDateToDashModel } from "@/lib/date";
import { formatNumber } from "@/lib/utils";
import { ExpensesJournalItem } from "@/types/company.types";
import ExportChart from "../chart/export-chart";

type ExpensesJournalProps = {
    isLoading: boolean;
    datas: ExpensesJournalItem[];
    currency: string;
};

export default function ExpensesJournalComponent({
    isLoading,
    datas,
    currency,
}: ExpensesJournalProps) {

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="font-semibold">Journal des dépenses</h2>
            </div>

            {isLoading ? <Spinner /> : <ExportChart
                items={datas.map(data => ({
                    id: data.id,
                    name: data.source,
                    total: data.amount
                }))}
                currency={currency}
                isLoading={isLoading}
            />}

            <div className="border border-neutral-200 px-4 rounded-xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="h-14">
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    Date
                                </TableHead>
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    Source
                                </TableHead>
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    Montant
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={12}>
                                        <div className="flex justify-center items-center py-6 w-full">
                                            <Spinner />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : datas.length > 0 ? (
                                datas.map((item) => (
                                    <TableRow key={item.id} className="h-12">
                                        <TableCell className="text-center whitespace-nowrap">
                                            {formatDateToDashModel(item.date)}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {item.source}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {formatNumber(item.amount || 0)} {currency}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={12}
                                        className="py-6 text-gray-500 text-sm text-center"
                                    >
                                        Aucune donnée trouvée.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
