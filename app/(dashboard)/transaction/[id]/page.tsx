'use client'
import { getUniqueTransaction } from '@/action/transaction.action';
import AccessContainer from '@/components/errors/access-container'
import Header from '@/components/header/header';
import { useAccess } from '@/hook/useAccess';
import useQueryAction from '@/hook/useQueryAction';
import { RequestResponse } from '@/types/api.types';
import { TransactionType } from '@/types/transaction.type';
import { useParams, useSearchParams } from 'next/navigation';
import { Activity, useEffect, useState } from 'react';
import EditDibursementForm from '../_components/edit-dibursement-form';
import EditReceiptForm from '../_components/edit-receipt-form';

export default function EditTransactionPage() {
    const { access: modifyAcccess, loading: loadingModifyAccess } = useAccess("TRANSACTION", "MODIFY");
    const params = useParams();
    const id = params.id as string;
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const [transaction, setTransaction] = useState<TransactionType>();


    const { mutate: mutateGetTransaction, isPending } = useQueryAction<
        { id: string, type: "receipt" | "dibursement" },
        RequestResponse<TransactionType>
    >(getUniqueTransaction, () => { }, "transaction");

    useEffect(() => {
        if (id && type) {
            mutateGetTransaction({ id, type: type === "RECEIPT" ? "receipt" : "dibursement" }, {
                onSuccess(data) {
                    if (data.data) {
                        setTransaction(data.data);
                    }
                },
            });
        }
    }, [id, type])


    return (
        <div className="space-y-9 h-full">
            <Header back={1} title="Modifier la transaction" />
            <div className="space-y-2 h-full w-(--left-sidebar-width)">
                <AccessContainer hasAccess={modifyAcccess} resource="TRANSACTION" loading={loadingModifyAccess || isPending}>
                    <Activity mode={type === "DISBURSEMENT" ? "visible" : "hidden"} >
                        <EditDibursementForm
                            transaction={transaction}
                        />
                    </Activity>
                    <Activity mode={type === "RECEIPT" ? "visible" : "hidden"} >
                        <EditReceiptForm
                            transaction={transaction}
                        />
                    </Activity>
                </AccessContainer>
            </div>
        </div>
    )
}
