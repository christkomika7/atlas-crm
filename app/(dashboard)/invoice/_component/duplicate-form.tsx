import { duplicateInvoice } from '@/action/invoice.action';
import DuplicateBillboard from '@/components/modal/duplicate-billboard';
import ModalContainer from '@/components/modal/modal-container';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import Spinner from '@/components/ui/spinner';
import useQueryAction from '@/hook/useQueryAction';
import { invoiceDuplicates } from '@/lib/data';
import useItemStore, { ItemType } from '@/stores/item.store';
import { RequestResponse } from '@/types/api.types';
import { InvoiceType } from '@/types/invoice.types';
import { useState } from 'react'
import { toast } from 'sonner';

type DuplicateFormProps = {
    data: InvoiceType;
    closeModal: () => void
    refreshInvoices: () => void;
}

export default function DuplicateForm({ data, closeModal, refreshInvoices }: DuplicateFormProps) {
    const [filter, setFilter] = useState("");
    const [open, setOpen] = useState(false);
    const clear = useItemStore.use.clearItem();


    const { mutate: mutateDuplicateInvoice, isPending: isDuplicatingInvoice } = useQueryAction<
        { invoiceId: string, duplicateTo: "invoice" | "quote" | "delivery-note", items?: ItemType[] },
        RequestResponse<null>
    >(duplicateInvoice, () => { }, "invoices");

    function duplicateTo(items?: ItemType[]) {
        if (!data.id) {
            toast.error("Aucun devis trouvés");
            return;
        };
        if (!filter) {
            toast.error("Choisissez le modèle de duplication de l’élément.");
            return
        }
        const hasBillboard = data.items.some((item) => item.itemType === "billboard")
        if (filter === "invoice" && hasBillboard && !items) {
            return setOpen(true);
        }

        if (filter === "invoice" && hasBillboard && items) {
            mutateDuplicateInvoice({ invoiceId: data.id, duplicateTo: filter as "invoice" | "quote" | "delivery-note", items }, {
                onSuccess(data) {
                    if (data.data) {
                        clear()
                        refreshInvoices()
                    }
                },
            });
            return
        }

        mutateDuplicateInvoice({ invoiceId: data.id, duplicateTo: filter as "invoice" | "quote" | "delivery-note" }, {
            onSuccess(data) {
                if (data.data) {
                    clear()
                    refreshInvoices()
                }
            },
        });
    }

    return (
        <div className='flex flex-col gap-y-3'>
            <div className='w-full flex'>
                <Combobox
                    className='w-full'
                    datas={invoiceDuplicates}
                    value={filter}
                    setValue={setFilter}
                    placeholder="Sélectionner le type de duplication"
                    searchMessage="Rechercher un type de duplication"
                    noResultsMessage="Aucun type de duplication trouvé."
                />
            </div>
            <ModalContainer
                size="md"
                title="Correction conflit panneau"
                open={open}
                setOpen={(value) =>
                    setOpen(true)
                }
                onClose={() => setOpen(false)}
            >
                <DuplicateBillboard data={data} closeModal={closeModal} duplicateTo={duplicateTo} isDuplicating={isDuplicatingInvoice} />
            </ModalContainer>
            <div className='flex gap-x-2'>
                <Button variant="primary" disabled={isDuplicatingInvoice} onClick={() => duplicateTo()} >
                    {isDuplicatingInvoice ? <Spinner /> :
                        "Dupliquer"
                    }
                </Button>
                <Button variant="primary"
                    onClick={e => {
                        e.preventDefault()
                        closeModal()
                    }}
                    className="justify-center bg-neutral-100 max-w-xs text-black"
                >Quitter</Button>
            </div>
        </div>
    )
}
