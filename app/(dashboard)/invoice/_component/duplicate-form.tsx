import { duplicateInvoice } from '@/action/invoice.action';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import Spinner from '@/components/ui/spinner';
import useQueryAction from '@/hook/useQueryAction';
import { invoiceDuplicates } from '@/lib/data';
import { RequestResponse } from '@/types/api.types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

type DuplicateFormProps = {
    id: string;
    closeModal: () => void
    refreshInvoices: () => void;
}

export default function DuplicateForm({ id, closeModal, refreshInvoices }: DuplicateFormProps) {
    const router = useRouter();
    const [filter, setFilter] = useState("");

    const { mutate: mutateDuplicateInvoice, isPending: isDuplicatingInvoice } = useQueryAction<
        { invoiceId: string, duplicateTo: "invoice" | "quote" | "delivery-note" },
        RequestResponse<null>
    >(duplicateInvoice, () => { }, "invoices");

    function duplicateTo() {
        if (!id) return toast.error("Aucun devis trouvés");
        if (!filter) return toast.error("Choisissez le modèle de duplication de l’élément.");
        mutateDuplicateInvoice({ invoiceId: id, duplicateTo: filter as "invoice" | "quote" | "delivery-note" }, {
            onSuccess(data) {
                if (data.data) {
                    refreshInvoices()
                }
            },
        })
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
            <div className='flex gap-x-2'>
                <Button variant="primary" disabled={isDuplicatingInvoice} onClick={duplicateTo} >
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
