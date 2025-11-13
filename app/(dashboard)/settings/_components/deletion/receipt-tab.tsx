'use client';

import { getDeletions, updateDeletion } from '@/action/deletion.action';
import MissingData from '@/components/notification/missing-data';
import Spinner from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import useQueryAction from '@/hook/useQueryAction';
import { formatDateToDashModel } from '@/lib/date';
import { $Enums } from '@/lib/generated/prisma';
import { generateAmaId } from '@/lib/utils';
import { useDataStore } from '@/stores/data.store';
import { RequestResponse } from '@/types/api.types';
import { DeletionType } from '@/types/deletion.types';
import { ListRestartIcon, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react'

export default function ReceiptTab() {
    const companyId = useDataStore.use.currentCompany();
    const [deletions, setDeletions] = useState<DeletionType[]>([]);

    const { mutate: mutateGetDeletions, isPending: isGettingDeletions } = useQueryAction<
        { companyId: string; type: $Enums.DeletionType },
        RequestResponse<DeletionType[]>
    >(getDeletions, () => { }, "deletions");

    const { mutate: mutateUpdateDeletion, isPending: isUpdatingDeletion } = useQueryAction<
        { id: string; type: $Enums.DeletionType, action: "cancel" | "delete", recordId: string },
        RequestResponse<DeletionType[]>
    >(updateDeletion, () => { }, "deletions");

    useEffect(() => {
        if (companyId) {
            mutateGetDeletions({ companyId, type: "RECEIPTS" }, {
                onSuccess(data) {
                    if (data.data) {
                        setDeletions(data.data);
                    }
                },
            })
        }

    }, [companyId])


    function update(action: "cancel" | "delete", id: string, recordId: string,) {
        if (companyId) {
            mutateUpdateDeletion({ id, type: "RECEIPTS", action, recordId }, {
                onSuccess() {
                    mutateGetDeletions({ companyId, type: "RECEIPTS" }, {
                        onSuccess(data) {
                            if (data.data) {
                                setDeletions(data.data);
                            }
                        },
                    })
                }
            })

        }

    }

    if (!companyId) return <MissingData
        title='Aucune entreprise trouvée'
        content='Veuillez choisir une entreprise avant de poursuivre la configuration des documents.'
    />


    return (
        <div className="border border-neutral-200 rounded-xl">
            <Table>
                <TableHeader>
                    <TableRow className="h-14">
                        <TableHead className="font-medium text-center">N°</TableHead>
                        <TableHead className="font-medium text-center">Client</TableHead>
                        <TableHead className="font-medium text-center">Date</TableHead>
                        <TableHead className="font-medium text-center">Montant</TableHead>
                        <TableHead className="font-medium text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isGettingDeletions || isUpdatingDeletion ? (
                        <TableRow>
                            <TableCell colSpan={9}>
                                <div className="flex justify-center items-center py-6 w-full">
                                    <Spinner />
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : deletions.length > 0 ? (
                        deletions.map((deletion, index) => (
                            <TableRow
                                key={deletion.id}
                                className={`h-16 transition-color`}
                            >
                                <TableCell className="text-neutral-600 text-center">
                                    {generateAmaId(index + 1, false)}
                                </TableCell>
                                <TableCell className="text-neutral-600 text-center">
                                    {deletion.forUser}
                                </TableCell>
                                <TableCell className="text-neutral-600 text-center">
                                    {formatDateToDashModel(deletion.date)}
                                </TableCell>
                                <TableCell className="text-neutral-600 text-center">
                                    {deletion.amount}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className='flex justify-center items-center gap-x-2 mx-auto w-full'>
                                        <span className='cursor-pointer' onClick={() => update('cancel', deletion.id, deletion.recordId)}>
                                            <ListRestartIcon className='size-4.5 text-neutral-600' />
                                        </span>
                                        <span className='cursor-pointer' onClick={() => update('delete', deletion.id, deletion.recordId)}>
                                            <Trash2 className='size-4.5 text-red' />
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={9}
                                className="py-6 text-gray-500 text-sm text-center"
                            >
                                Aucune donnée trouvée.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
