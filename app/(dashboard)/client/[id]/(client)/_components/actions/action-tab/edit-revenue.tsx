import AccessContainer from '@/components/errors/access-container'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import Spinner from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hook/useAccess'
import { formatDateToDashModel } from '@/lib/date'
import { cn, formatNumber } from '@/lib/utils'
import useClientStore from '@/stores/client.store'
import { useDataStore } from '@/stores/data.store'
import { RevenueType } from '@/types/client.types'
import React, { Dispatch, SetStateAction } from 'react'

type EditRevenueProps = {
    setHasNoInvoicePaid: Dispatch<SetStateAction<boolean>>;
    hasNoInvoicePaid?: boolean;
    setDate: Dispatch<SetStateAction<{
        start?: Date;
        end?: Date;
    }>>;
    date?: { start?: Date; end?: Date };
    revenues: RevenueType | undefined;
    isLoading?: boolean;
}

export default function EditRevenue({ setHasNoInvoicePaid, hasNoInvoicePaid, setDate, date, revenues, isLoading }: EditRevenueProps) {
    const client = useClientStore.use.client();
    const currency = useDataStore.use.currency();

    const { access: readAccess, loading } = useAccess("CLIENTS", "READ");

    return (
        <AccessContainer hasAccess={readAccess} resource='CLIENTS' loading={loading}>
            <ScrollArea className="max-h-137.5 pr-4">
                <div className='grid grid-cols-[1fr_400px] gap-x-12'>
                    <div className="border border-neutral-200 rounded-xl">
                        <Table>
                            <TableHeader>
                                <TableRow className="h-14">
                                    <TableHead className="font-medium">Mode</TableHead>
                                    <TableHead className="font-medium">
                                        Numéro
                                    </TableHead>
                                    <TableHead className="font-medium">Échéance</TableHead>
                                    <TableHead className="font-medium">Statut</TableHead>
                                    <TableHead className="font-medium">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div className="flex justify-center items-center py-6 w-full">
                                                <Spinner />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        <TableRow className="bg-gray-50">
                                            <TableCell className="text-sm text-gray-600 font-medium py-3">
                                                Solde de départ
                                            </TableCell>
                                            <TableCell />
                                            <TableCell />
                                            <TableCell />
                                            <TableCell className="text-sm text-gray-600 py-3">
                                                {formatNumber(revenues?.initialBalance ?? 0)} {currency}
                                            </TableCell>
                                        </TableRow>

                                        {revenues && revenues.invoices.length > 0 ? (
                                            revenues.invoices.map((revenue, index) => (
                                                <TableRow
                                                    key={index}
                                                    className="h-16 transition-colors"
                                                >
                                                    <TableCell className="text-neutral-600 font-medium">
                                                        Facture
                                                    </TableCell>
                                                    <TableCell className="text-neutral-600">
                                                        {revenue.reference}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`${revenue.echeance.color} font-medium`}
                                                    >
                                                        {revenue.echeance.text === "Expiré"
                                                            ? `Depuis ${revenue.echeance.daysLeft.replace('-', '')}`
                                                            : `Dans ${revenue.echeance.daysLeft}`}
                                                    </TableCell>
                                                    <TableCell className={cn(revenue.statut ? "text-emerald-600" : "text-red")}>
                                                        {revenue.statut ? "Soldé" : 'Non soldé'}
                                                    </TableCell>
                                                    <TableCell className="text-neutral-600">
                                                        {formatNumber(revenue.totalTTC)} {currency}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={9}
                                                    className="py-6 text-gray-500 text-sm text-center"
                                                >
                                                    Aucun relevé trouvé.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className='space-y-4'>
                        <div className='pb-8 border-b border-neutral-400'>
                            <h2 className='text-2xl font-semibold mb-4'>Relevé</h2>
                            <div className='flex justify-between gap-x-2 mb-2'>
                                <h2 className='font-medium'>Date</h2> <p className='text-sm text-neutral-600'>{formatDateToDashModel(new Date())}</p>
                            </div>
                            <div className='flex justify-between gap-x-2 mb-10'>
                                <h2 className='font-medium'>Client</h2> <p className='text-sm text-neutral-600'>{client?.firstname} {client?.lastname} ({client?.companyName})</p>
                            </div>
                            <div>
                                <Label className='flex gap-x-3 text-base'>
                                    <Checkbox checked={hasNoInvoicePaid} onCheckedChange={e => setHasNoInvoicePaid(e as boolean)} className='size-6' />
                                    N'afficher que les factures impayées
                                </Label>
                            </div>
                        </div>
                        <div className='py-2 mb-4'>
                            <div className='flex items-center justify-between gap-x-2 mb-4'>
                                <h2 className='font-medium'>Début</h2>                <DatePicker
                                    label="Date limite"
                                    value={date?.start}
                                    mode="single"
                                    onChange={(e) => setDate({ ...date, start: e as Date })}
                                />
                            </div>
                            <div className='flex items-center justify-between gap-x-2 mb-10'>
                                <h2 className='font-medium'>Fin</h2> <DatePicker
                                    label="Date limite"
                                    value={date?.end}
                                    mode="single"
                                    onChange={(e) => setDate({ ...date, end: e as Date })}
                                />
                            </div>
                        </div>
                        <div className='flex items-center justify-between gap-x-2'>
                            <h2 className='font-medium'>Total TTC</h2>      {formatNumber(revenues?.totalTTC || 0)} {currency}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </AccessContainer>
    )
}
