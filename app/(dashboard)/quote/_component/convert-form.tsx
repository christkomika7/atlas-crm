import { convertQuote } from '@/action/quote.action';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import Spinner from '@/components/ui/spinner';
import useQueryAction from '@/hook/useQueryAction';
import { convert } from '@/lib/data';
import { RequestResponse } from '@/types/api.types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

type ConvertFormProps = {
    id: string;
    closeModal: () => void
}

export default function ConvertForm({ id, closeModal }: ConvertFormProps) {
    const router = useRouter();
    const [filter, setFilter] = useState("");


    const { mutate: mutateQuote, isPending: isConvertedQuote } = useQueryAction<
        { id: string, convertTo: "invoice" | "delivery-note" },
        RequestResponse<string>
    >(convertQuote, () => { }, "quotes");

    function convertTo() {
        if (!id) return toast.error("Aucun devis trouvés");
        if (!filter) return toast.error("Veuillez selectionner le type de convertion");
        mutateQuote({ id, convertTo: filter as "invoice" | "delivery-note" }, {
            onSuccess(data) {
                if (data.data) {
                    if (filter === "invoice") {
                        return router.push(`/invoice/${data.data}`);
                    }
                    return router.push(`/delivery-note/${data.data}`)
                }
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
                <Button variant="primary" disabled={isConvertedQuote} onClick={convertTo} >
                    {isConvertedQuote ? <Spinner /> :
                        "Convertir"
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
