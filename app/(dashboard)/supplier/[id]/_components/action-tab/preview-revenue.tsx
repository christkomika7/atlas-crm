import AccessContainer from '@/components/errors/access-container';
import RevenueRecord from '@/components/pdf/revenue-record';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAccess } from '@/hook/useAccess';
import { formatDateToDashModel } from '@/lib/date';
import { downloadComponentAsPDF } from '@/lib/pdf';
import { formatNumber } from '@/lib/utils'
import { useDataStore } from '@/stores/data.store';
import useSupplierStore from '@/stores/supplier.store';
import { SupplierRevenueType } from '@/types/supplier.types';

type PreviewRevenueProps = {
    revenues?: SupplierRevenueType;
    isLoading: boolean;
}

export default function PreviewRevenue({ revenues, isLoading }: PreviewRevenueProps) {
    const filename = `Relevé ${revenues?.supplier.companyName} du ${formatDateToDashModel(revenues?.startDate || new Date())} au ${formatDateToDashModel(revenues?.endDate || new Date())}`
    const currency = useDataStore.use.currency();
    const supplier = useSupplierStore.use.supplier();

    const { access: readAccess, loading } = useAccess("SUPPLIERS", "READ");

    return (
        <AccessContainer loading={loading} resource='SUPPLIERS' hasAccess={readAccess}>
            <div className="max-h-[500px] pr-4">
                <div className='grid grid-cols-[1fr_400px] gap-2'>
                    <ScrollArea className="max-h-[500px] py-4 pr-4">
                        <RevenueRecord
                            type="supplier-revenue-record"
                            id="supplier-revenue-record"
                            firstColor={revenues?.supplier.company.documentModel.primaryColor || "#fbbf24"}
                            secondColor={revenues?.supplier.company.documentModel.secondaryColor || "#fef3c7"}
                            logo={revenues?.supplier.company.documentModel.logo}
                            logoSize={revenues?.supplier.company.documentModel.size || "Medium"}
                            logoPosition={revenues?.supplier.company.documentModel.position || "Center"}
                            revenue={revenues as SupplierRevenueType}
                            isLoading={isLoading}
                        />
                    </ScrollArea>
                    <div className='space-y-4'>
                        <div className='pb-8 border-b border-neutral-400'>
                            <h2 className='text-2xl font-semibold mb-4'>Relevé</h2>
                            <div className='flex justify-between gap-x-2 mb-2'>
                                <h2 className='font-medium'>Date</h2> <p className='text-sm text-neutral-600'>{formatDateToDashModel(new Date())}</p>
                            </div>
                            <div className='flex justify-between gap-x-2'>
                                <h2 className='font-medium'>Fournisseur</h2> <p className='text-sm text-neutral-600'>{supplier?.firstname} {supplier?.lastname} ({supplier?.companyName})</p>
                            </div>
                        </div>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between gap-x-2'>
                                <h2 className='font-medium'>Total TTC</h2>  {formatNumber(revenues?.totalTTC || 0)} {currency}
                            </div>
                            <div className='flex items-center justify-between gap-x-2'>
                                <h2 className='font-medium'>Payée</h2> {formatNumber(revenues?.totalPaid || 0)} {currency}
                            </div>
                            <div className='flex items-center justify-between gap-x-2'>
                                <h2 className='font-medium'>Solde</h2> {formatNumber(Number(revenues?.totalDue || 0) - Number(revenues?.totalPaid || 0))} {currency}
                            </div>
                            <Button variant="primary"
                                onClick={() => downloadComponentAsPDF("supplier-revenue-record", filename, {
                                    padding: 0,
                                    margin: 0,
                                    quality: 0.98,
                                    scale: 3,
                                    headerText: ``
                                })}
                            >
                                Télécharger
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AccessContainer>
    )
}
