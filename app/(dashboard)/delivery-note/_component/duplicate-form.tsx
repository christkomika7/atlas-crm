import { duplicateDeliveryNote } from '@/action/delivery-note.action';
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
    refreshDeliveryNote: () => void;
}

export default function DuplicateForm({ id, closeModal, refreshDeliveryNote }: DuplicateFormProps) {
    const router = useRouter();
    const [filter, setFilter] = useState("");


    const { mutate: mutateDuplicateDeliveryNote, isPending: isDuplicatingDeliveryNote } = useQueryAction<
        { id: string, duplicateTo: "quote" | "delivery-note" },
        RequestResponse<null>
    >(duplicateDeliveryNote, () => { }, "delivery-notes");

    function duplicateTo() {
        if (!id) return toast.error("Aucun bon de livraison trouvés");
        if (!filter) return toast.error("Choisissez le modèle de duplication de l’élément.");
        mutateDuplicateDeliveryNote({ id, duplicateTo: filter as "quote" | "delivery-note" }, {
            onSuccess() {
                refreshDeliveryNote();
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
                <Button variant="primary" disabled={isDuplicatingDeliveryNote} onClick={duplicateTo} >
                    {isDuplicatingDeliveryNote ? <Spinner /> :
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
