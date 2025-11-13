import ModalContainer from "@/components/modal/modal-container";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { SetStateAction, useState } from "react";
import ClientContractCreate from "./client-contract-create";
import LessorContractCreate from "./lessor-contract-create";

type ContractMenuProps = {
    refreshContract: () => void;
}

export default function ContractMenu({ refreshContract }: ContractMenuProps) {
    const [open, setOpen] = useState({
        client: false,
        lessor: false,
    });
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="primary" className="p-0 rounded-lg w-full">
                    Contract
                    <ChevronDownIcon className="w-4 h-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 w-[220px]">
                <ul className="p-2">
                    <li>
                        <ModalContainer
                            size="sm"
                            action={
                                <Button
                                    variant="primary"
                                    className="bg-white hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
                                >
                                    Ajouter un contrat client
                                </Button>
                            }
                            title="Nouveau contrat client"
                            open={open.client}
                            setOpen={function (value: SetStateAction<boolean>): void {
                                setOpen((prev) => ({ ...prev, client: value as boolean }));
                            }}
                        >
                            <ClientContractCreate
                                refreshContract={refreshContract}
                                closeModal={() =>
                                    setOpen((prev) => ({ ...prev, client: false }))
                                }
                            />
                        </ModalContainer>
                    </li>
                    <li>
                        <ModalContainer
                            size="sm"
                            action={
                                <Button
                                    variant="primary"
                                    className="bg-white hover:bg-blue shadow-none !h-9 text-black hover:text-white transition-[color,background-color,box-shadow]"
                                >
                                    Ajouter un contrat bailleur
                                </Button>
                            }
                            title="Nouveau contrat bailleur"
                            open={open.lessor}
                            setOpen={function (value: SetStateAction<boolean>): void {
                                setOpen((prev) => ({ ...prev, lessor: value as boolean }));
                            }}
                        >
                            <LessorContractCreate
                                refreshContract={refreshContract}
                                closeModal={() =>
                                    setOpen((prev) => ({ ...prev, lessor: false }))
                                }
                            />
                        </ModalContainer>
                    </li>
                </ul>
            </PopoverContent>
        </Popover>
    );
}
