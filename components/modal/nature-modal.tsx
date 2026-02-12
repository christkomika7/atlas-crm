import { createNature, deleteNature } from "@/action/transaction.action";
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
import { NatureSchemaType } from "@/lib/zod/transaction.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { TransactionNatureType } from "@/types/transaction.type";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type NatureModalProps = {
    categoryId: string;
}

export default function NatureModal({ categoryId }: NatureModalProps) {
    const companyId = useDataStore.use.currentCompany();

    const natures = useTransactionStore.use.natures();
    const addNature = useTransactionStore.use.addNature();
    const removeNature = useTransactionStore.use.removeNature();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [currentId, setCurrentId] = useState("");

    const { mutate: mutateCreateNature, isPending: isCreatingNature } = useQueryAction<
        NatureSchemaType,
        RequestResponse<TransactionNatureType>
    >(createNature, () => { }, "nature");

    const {
        mutate: mutateRemoveNature,
        isPending: isRemovingNature,
    } = useQueryAction<{ natureId: string }, RequestResponse<TransactionNatureType>>(
        deleteNature,
        () => { },
        "nature"
    );

    function retrieveNature(
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        id: string
    ) {
        e.stopPropagation();
        e.preventDefault();
        if (!id) return toast.error("Aucun identifiant trouvé.");
        setCurrentId(id);

        mutateRemoveNature(
            { natureId: id },
            {
                onSuccess(data) {
                    if (data.data) {
                        removeNature(data.data.id);
                        setName("");
                    }
                },
            }
        );
    }

    function submit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        e.preventDefault();

        if (!categoryId) return toast.error("Veuillez sélectionner une catégorie");
        if (!companyId) return toast.error("Aucune entreprise trouvée.");
        if (!name) return toast.error("Aucune nature insérée.");
        mutateCreateNature(
            { name, companyId, categoryId },
            {
                onSuccess(data) {
                    if (data.data) {
                        addNature(data.data);
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
                    Nature
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter une nature</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="">
                    <ScrollArea className="h-[200px]">
                        <ul>
                            {natures.length === 0 ? (
                                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                                    Aucune nature trouvée.
                                </li>
                            ) : (
                                natures.map((nature) => (
                                    <li
                                        key={nature.id}
                                        className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                                    >
                                        {nature.name}{" "}
                                        <div className="flex items-center gap-x-2">
                                            <span
                                                onClick={(e) =>
                                                    retrieveNature(e, nature.id)
                                                }
                                                className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                                            >
                                                <XIcon className="w-[13px] h-[13px]" />
                                            </span>{" "}
                                            {currentId === nature.id &&
                                                isRemovingNature && <Spinner size={10} />}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </ScrollArea>
                    <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
                        <TextInput
                            design="float"
                            label="Nature de la transaction"
                            value={name}
                            handleChange={(e) => setName(e as string)}
                        />
                        <Button
                            onClick={submit}
                            variant="primary"
                            disabled={isCreatingNature || isRemovingNature}
                        >
                            {isCreatingNature ? <Spinner /> : "Ajouter"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
