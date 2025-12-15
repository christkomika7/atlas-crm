import Spinner from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateToDashModel } from '@/lib/date';
import { formatNumber } from '@/lib/utils';
import { PaymentsByDateItem } from '@/types/company.types';
import ExportChart from '../chart/export-chart';

type BuyDateProps = {
    isLoading: boolean;
    datas: PaymentsByDateItem[];
    currency: string;
}

export default function BuyDate({ isLoading, datas, currency }: BuyDateProps) {
    const chartItems = datas.map(data => ({
        id: data.id,
        name: data.client === "-" ? "Inconnu" : data.client,
        total: data.amount
    }));
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="font-semibold">Paiements par date</h2>
            </div>
            {isLoading ? <Spinner /> :
                <ExportChart
                    items={chartItems}
                    currency={currency}
                    isLoading={isLoading}
                />
            }
            <div className="border border-neutral-200 px-4 rounded-xl">
                <Table>
                    <TableHeader>
                        <TableRow className="h-14">

                            <TableHead className="font-medium text-center">
                                Date
                            </TableHead>
                            <TableHead className="font-medium text-center">Client</TableHead>
                            <TableHead className="font-medium text-center">Montant encaissé</TableHead>

                        </TableRow>
                    </TableHeader>
                    <TableBody>

                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <div className="flex justify-center items-center py-6 w-full">
                                        <Spinner />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : datas.length > 0 ? (
                            datas.map((data) => (
                                <TableRow key={data.id} className="h-12">
                                    <TableCell className="text-center">{formatDateToDashModel(data.date)}</TableCell>
                                    <TableCell className="text-center">{data.client === "-" ? "Inconnu" : data.client}</TableCell>
                                    <TableCell className="text-center">{formatNumber((data.amount || 0))} {currency}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
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
    )
}
