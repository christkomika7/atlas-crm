import { createAllocation, deleteAllocation } from "@/action/transaction.action";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { AllocationSchemaType } from "@/lib/zod/transaction.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { AllocationType } from "@/types/transaction.type";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


type AllocationModalProps = {
    natureId: string;
}

export default function AllocationModal({ natureId }: AllocationModalProps) {
    const companyId = useDataStore.use.currentCompany();

    const allocations = useTransactionStore.use.allocations();
    const addAllocation = useTransactionStore.use.addAllocation();
    const removeAllocation = useTransactionStore.use.removeAllocation();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [currentId, setCurrentId] = useState("");

    const { mutate: mutateCreateAllocation, isPending: isCreatingAllocation } = useQueryAction<
        AllocationSchemaType,
        RequestResponse<AllocationType>
    >(createAllocation, () => { }, "allocation");

    const {
        mutate: mutateRemoveAllocation,
        isPending: isRemovingAllocation,
    } = useQueryAction<{ allocationId: string }, RequestResponse<AllocationType>>(
        deleteAllocation,
        () => { },
        "allocation"
    );

    function retrieveAllocation(
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        id: string
    ) {
        e.stopPropagation();
        e.preventDefault();
        if (!id) return toast.error("Aucun identifiant trouvé.");
        setCurrentId(id);

        mutateRemoveAllocation(
            { allocationId: id },
            {
                onSuccess(data) {
                    if (data.data) {
                        removeAllocation(data.data.id);
                        setName("");
                    }
                },
            }
        );
    }

    function submit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        e.preventDefault();

        if (!companyId) return toast.error("Aucune entreprise trouvée.");
        if (!name) return toast.error("Aucune allocation insérée.");
        if (!natureId) return toast.error("Aucune nature est trouvée.");

        mutateCreateAllocation(
            { name, companyId, natureId },
            {
                onSuccess(data) {
                    if (data.data) {
                        addAllocation(data.data);
                        setName("");
                    }
                },
            }
        );
    }

    return (
        <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
            <DialogTrigger asChild>
                <Button
                    onClick={() => setOpen(!open)}
                    variant="primary"
                    className="!h-9 font-medium"
                >
                    <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Ajouter un
                    Allocation
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter une allocation</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="">
                    <ScrollArea className="h-[200px]">
                        <ul>
                            {allocations.length === 0 ? (
                                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                                    Aucune allocation trouvée.
                                </li>
                            ) : (
                                allocations.map((allocation) => (
                                    <li
                                        key={allocation.id}
                                        className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                                    >
                                        {allocation.name}{" "}
                                        <div className="flex items-center gap-x-2">
                                            <span
                                                onClick={(e) =>
                                                    retrieveAllocation(e, allocation.id)
                                                }
                                                className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                                            >
                                                <XIcon className="w-[13px] h-[13px]" />
                                            </span>{" "}
                                            {currentId === allocation.id &&
                                                isRemovingAllocation && <Spinner size={10} />}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </ScrollArea>
                    <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
                        <TextInput
                            design="float"
                            label="Type d'allocation"
                            value={name}
                            handleChange={(e) => setName(e as string)}
                        />
                        <Button
                            onClick={submit}
                            variant="primary"
                            disabled={isCreatingAllocation || isRemovingAllocation}
                        >
                            {isCreatingAllocation ? <Spinner /> : "Ajouter"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
