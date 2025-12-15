import Spinner from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { DebtorAccountAgingItem } from "@/types/company.types";
import ExportChart from "../chart/export-chart";

type DebtorAccountAgingProps = {
    isLoading: boolean;
    datas: DebtorAccountAgingItem[];
    currency: string;
};

export default function DebtorAccountAgingComponent({
    isLoading,
    datas,
    currency,
}: DebtorAccountAgingProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="font-semibold">Âge des comptes débiteurs</h2>
            </div>
            {isLoading ? <Spinner /> : <ExportChart
                items={datas.map(data => ({
                    id: data.id,
                    name: data.client,
                    total: data.totalDue
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
                                    Client
                                </TableHead>
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    Total dû
                                </TableHead>
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    Payable aujourd'hui
                                </TableHead>
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    1–30 jours
                                </TableHead>
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    31–60 jours
                                </TableHead>
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    61–90 jours
                                </TableHead>
                                <TableHead className="font-medium text-center whitespace-nowrap">
                                    91+ jours
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={10}>
                                        <div className="flex justify-center items-center py-6 w-full">
                                            <Spinner />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : datas.length > 0 ? (
                                datas.map((item) => (
                                    <TableRow key={item.id} className="h-12">
                                        <TableCell className="text-center whitespace-nowrap">
                                            {item.client}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {formatNumber(item.totalDue || 0)} {currency}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {formatNumber(item.payableToday || 0)} {currency}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {formatNumber(item.delay1to30 || 0)} {currency}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {formatNumber(item.delay31to60 || 0)} {currency}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {formatNumber(item.delay61to90 || 0)} {currency}
                                        </TableCell>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {formatNumber(item.delayOver91 || 0)} {currency}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
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
