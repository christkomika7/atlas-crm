import Spinner from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDateToDashModel } from '@/lib/date';
import { formatNumber } from '@/lib/utils';
import { SalesByBillboardItem } from '@/types/company.types';
import ExportChart from '../chart/export-chart';

type SellBillbaordProps = {
    isLoading: boolean;
    datas: SalesByBillboardItem[];
    currency: string;
}

export default function SellBillbaord({ isLoading, datas, currency }: SellBillbaordProps) {
    const chartItems = datas.map(data => ({
        id: data.id,
        name: data.name,
        total: data.totalGenerated
    }));
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="font-semibold">Ventes par panneaux publicitaires</h2>
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
                            <TableHead className="font-medium text-center">Panneau</TableHead>
                            <TableHead className="font-medium text-center">Modèle</TableHead>
                            <TableHead className="font-medium text-center">Nombre de facture</TableHead>
                            <TableHead className="font-medium text-center">Montant généré</TableHead>
                            <TableHead className="font-medium text-center">Total payé</TableHead>
                            <TableHead className="font-medium text-center">Due</TableHead>
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
                                    <TableCell className="text-center">
                                        {data.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {data.type}
                                    </TableCell>
                                    <TableCell className="text-center">{data.count}</TableCell>
                                    <TableCell className="text-center">{formatNumber(data.totalGenerated || 0)} {currency}</TableCell>
                                    <TableCell className="text-center">{formatNumber(data.totalPaid || 0)} {currency}</TableCell>
                                    <TableCell className="text-center">{formatNumber(data.totalRemaining || 0)} {currency}</TableCell>
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
