'use client';

import { getUniqueContract } from '@/action/contract.action';
import Header from '@/components/header/header'
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Spinner from '@/components/ui/spinner';
import useQueryAction from '@/hook/useQueryAction';
import { $Enums } from '@/lib/generated/prisma';
import { downloadComponentAsPDF } from '@/lib/pdf';
import { RequestResponse } from '@/types/api.types';
import { ClientContractType, LessorContractType } from '@/types/contract-types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClientContract from '../_components/client-contract';
import LessorContract from '../_components/lessor-contract';

export default function PreviewContract() {
    const param = useParams();
    const [contract, setContract] = useState<ClientContractType | LessorContractType>();
    const [filename, setFilename] = useState("");
    const [contratType, setContractType] = useState<$Enums.ContractType>();

    const { mutate: mutateGetContract, isPending: isGettingContract } =
        useQueryAction<{ id: string, filter: $Enums.ContractType }, RequestResponse<ClientContractType | LessorContractType>>(
            getUniqueContract,
            () => { },
            "contract",
        );

    console.log({ param })

    useEffect(() => {
        if (param.id) {
            const [id, type] = param.id;
            setContractType(type as $Enums.ContractType);
            mutateGetContract(
                { id: id, filter: type as $Enums.ContractType },
                {
                    onSuccess(data) {
                        if (data.data) {
                            if (type === "CLIENT") {
                                setContract(data.data as ClientContractType);
                                setFilename("Contrat client");
                            } else {
                                setContract(data.data as LessorContractType);
                                setFilename("Contrat bailleur");
                            }
                        }
                    },
                },
            );
        }
    }, [param.id]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header back={1} title="Aperçu du contrat" />
            <div className="flex-1 px-6 py-4 overflow-auto">
                <ScrollArea className="pr-4 h-full">
                    <div className="gap-8 grid grid-cols-[1.5fr_1fr] pt-4 h-full">
                        <div className="space-y-4">
                            {!contract ? (
                                <Spinner />
                            ) : (
                                <>
                                    <div className="flex justify-end">
                                        <Button variant="primary" className="max-w-xs"
                                            onClick={() => downloadComponentAsPDF("contract", filename, {
                                                padding: 0,
                                                margin: 0,
                                                quality: 0.98,
                                                scale: 4
                                            })}
                                        >
                                            Télécharger
                                        </Button>
                                    </div>
                                    <div className="border rounded-xl border-neutral-100">
                                        {
                                            contratType === "CLIENT" ?
                                                <ClientContract contract={contract as ClientContractType} /> :
                                                <LessorContract contract={contract as LessorContractType} />
                                        }
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
