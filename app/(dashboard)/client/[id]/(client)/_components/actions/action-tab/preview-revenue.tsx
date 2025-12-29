import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateToDashModel } from '@/lib/date';
import { formatNumber } from '@/lib/utils'
import useClientStore from '@/stores/client.store';
import { useDataStore } from '@/stores/data.store';

export default function PreviewRevenue() {
    const currency = useDataStore.use.currency();
    const client = useClientStore.use.client();

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
                        <div className='flex justify-between gap-x-2'>
                            <h2 className='font-medium'>Client</h2> <p className='text-sm text-neutral-600'>{client?.firstname} {client?.lastname}</p>
                        </div>
                    </div>
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between gap-x-2'>
                            <h2 className='font-medium'>Total TTC</h2>      {formatNumber(0)} {currency}
                        </div>
                        <div className='flex items-center justify-between gap-x-2'>
                            <h2 className='font-medium'>Payée</h2>      {formatNumber(0)} {currency}
                        </div>
                        <div className='flex items-center justify-between gap-x-2'>
                            <h2 className='font-medium'>Solde</h2>      {formatNumber(0)} {currency}
                        </div>
                    </div>

                </div>
            </div>
        </ScrollArea>
    )
}
