'use client';

import { exportToWord, getUniqueContract } from '@/action/contract.action';
import Header from '@/components/header/header'
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Spinner from '@/components/ui/spinner';
import useQueryAction from '@/hook/useQueryAction';
import { $Enums } from '@/lib/generated/prisma';
import { RequestResponse } from '@/types/api.types';
import { ClientContractType, LessorContractType } from '@/types/contract-types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClientContract from '../_components/client-contract';
import LessorContract from '../_components/lessor-contract';
import { exportHtmlToWord } from '@/lib/word';
import { toast } from 'sonner';

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

    const { mutate: mutateConvertContract, isPending: isConvertingContract } =
        useQueryAction<{ html: string }, { status: string, message: string }>(
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


    function convertToWord() {
        // Récupérer le contenu HTML du contrat
        const contractElement = document.getElementById('contract');

        if (!contractElement) {
            toast.error("Impossible de trouver le contrat");
            return;
        }

        const html = contractElement.innerHTML;

        if (html) {
            mutateConvertContract({ html }, {
                onSuccess(data) {
                    toast.success(data.message);
                },
                onError(error) {
                    toast.error("Erreur lors de l'export du contrat");
                    console.error(error);
                }
            });
        } else {
            toast.error("Le contrat est vide");
        }
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
                                            onClick={() => convertToWord()}
                                            disabled={isConvertingContract}
                                        >
                                            {isConvertingContract ? <Spinner /> : "Télécharger"}
                                        </Button>
                                    </div>
                                    <div className="border rounded-xl overflow-hidden border-neutral-100">
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
