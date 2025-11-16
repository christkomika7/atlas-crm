'use client';

import { exportToWord, getUniqueContract } from '@/action/contract.action';
import Header from '@/components/header/header'
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Spinner from '@/components/ui/spinner';
import useQueryAction from '@/hook/useQueryAction';
import { $Enums } from '@/lib/generated/prisma';
import { RequestResponse } from '@/types/api.types';
import { ContractType } from '@/types/contract-types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Contract from '../_components/contract';

export default function PreviewContract() {
    const param = useParams();
    const [contract, setContract] = useState<ContractType>();
    const [filename, setFilename] = useState("");
    const [contratType, setContractType] = useState<$Enums.ContractType>();

    const { mutate: mutateGetContract, isPending: isGettingContract } =
        useQueryAction<{ id: string, filter: $Enums.ContractType }, RequestResponse<ContractType>>(
            getUniqueContract,
            () => { },
            "contract",
        );

    const { mutate: mutateConvertContract, isPending: isConvertingContract } =
        useQueryAction<{ contract: ContractType }, { status: string, message: string }>(
            exportToWord,
            () => { },
            "contract",
        );

    useEffect(() => {
        if (param.id) {
            const [id, type] = param.id;
            setContractType(type as $Enums.ContractType);
            mutateGetContract(
                { id: id, filter: type as $Enums.ContractType },
                {
                    onSuccess(data) {
                        if (data.data) {
                            setContract(data.data)
                        }
                    },
                },
            );
        }
    }, [param.id]);


    function convertToWord(contract: ContractType) {
        mutateConvertContract({ contract }, {
            onSuccess(data) {
                toast.success(data.message);
            },
            onError(error) {
                toast.error("Erreur lors de l'export du contrat");
                console.error(error);
            }
        });
    }
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
                                            onClick={() => convertToWord(contract as ContractType)}
                                            disabled={isConvertingContract}
                                        >
                                            {isConvertingContract ? <Spinner /> : "Télécharger"}
                                        </Button>
                                    </div>
                                    <div className="overflow-hidden">
                                        <Contract contract={contract} />
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
