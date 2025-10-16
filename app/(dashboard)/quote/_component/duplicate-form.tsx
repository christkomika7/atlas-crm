import { duplicateQuote } from '@/action/quote.action';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import Spinner from '@/components/ui/spinner';
import useQueryAction from '@/hook/useQueryAction';
import { convert } from '@/lib/data';
import { RequestResponse } from '@/types/api.types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

type DuplicateFormProps = {
    id: string;
    closeModal: () => void
    refreshQuotes: () => void;
}

export default function DuplicateForm({ id, closeModal, refreshQuotes }: DuplicateFormProps) {
    const router = useRouter();
    const [filter, setFilter] = useState("");


    const { mutate: mutateDuplicateQuote, isPending: isDuplicatingQuote } = useQueryAction<
        { id: string, duplicateTo: "quote" | "delivery-note" },
        RequestResponse<null>
    >(duplicateQuote, () => { }, "quotes");

    function duplicateTo() {
        if (!id) return toast.error("Aucun devis trouvés");
        if (!filter) return toast.error("Choisissez le modèle de duplication de l’élément.");
        mutateDuplicateQuote({ id, duplicateTo: filter as "quote" | "delivery-note" }, {
            onSuccess() {
                refreshQuotes();
            },
        })
    }

    return (
        <div className='flex flex-col gap-y-3'>
            <div className='w-full flex'>
                <Combobox
                    className='w-full'
                    datas={convert}
                    value={filter}
                    setValue={setFilter}
                    placeholder="Sélectionner le type de convertion"
                    searchMessage="Rechercher un type de convertion"
                    noResultsMessage="Aucun type de convertion trouvé."
                />
            </div>
            <div className='flex gap-x-2'>
                <Button variant="primary" disabled={isDuplicatingQuote} onClick={duplicateTo} >
                    {isDuplicatingQuote ? <Spinner /> :
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
