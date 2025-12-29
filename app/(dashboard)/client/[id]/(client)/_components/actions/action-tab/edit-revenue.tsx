import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateToDashModel } from '@/lib/date'
import { formatNumber } from '@/lib/utils'
import useClientStore from '@/stores/client.store'
import { useDataStore } from '@/stores/data.store'
import React, { useState } from 'react'

export default function EditRevenue() {
    const client = useClientStore.use.client();
    const currency = useDataStore.use.currency();
    const [hasNoInvoicePaid, setHasNoInvoicePaid] = useState(false);
    const [date, setDate] = useState<{ start?: Date; end?: Date }>({ start: undefined, end: undefined })
    return (
        <ScrollArea className="max-h-[550px] pr-4">
            <div className='grid grid-cols-[1fr_400px] gap-2'>
                <div>

                </div>
                <div className='space-y-4'>
                    <div className='pb-8 border-b border-neutral-400'>
                        <h2 className='text-2xl font-semibold mb-4'>Relevé</h2>
                        <div className='flex justify-between gap-x-2 mb-2'>
                            <h2 className='font-medium'>Date</h2> <p className='text-sm text-neutral-600'>{formatDateToDashModel(new Date())}</p>
                        </div>
                        <div className='flex justify-between gap-x-2 mb-10'>
                            <h2 className='font-medium'>Client</h2> <p className='text-sm text-neutral-600'>{client?.firstname} {client?.lastname}</p>
                        </div>
                        <div>
                            <Label className='flex gap-x-3 text-base'>
                                <Checkbox checked={hasNoInvoicePaid} onCheckedChange={e => setHasNoInvoicePaid(e as boolean)} className='size-6' />
                                N'afficher que les factures impayées
                            </Label>
                        </div>
                    </div>
                    <div className='py-2 mb-4'>
                        <div className='flex items-center justify-between gap-x-2 mb-2'>
                            <h2 className='font-medium'>Début</h2>                <DatePicker
                                label="Date limite"
                                value={date.start}
                                mode="single"
                                onChange={(e) => setDate({ ...date, start: e as Date })}
                            />
                        </div>
                        <div className='flex items-center justify-between gap-x-2 mb-10'>
                            <h2 className='font-medium'>Fin</h2> <DatePicker
                                label="Date limite"
                                value={date.end}
                                mode="single"
                                onChange={(e) => setDate({ ...date, end: e as Date })}
                            />
                        </div>
                    </div>
                    <div className='flex items-center justify-between gap-x-2'>
                        <h2 className='font-medium'>Total TTC</h2>      {formatNumber(0)} {currency}
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}
