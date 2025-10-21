import { createSource, deleteSource } from "@/action/transaction.action";
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
import { SourceSchemaType } from "@/lib/zod/transaction.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { SourceType } from "@/types/transaction.type";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SourceModalProps = {
    sourceType?: "check" | "cash" | "bank-transfer"
}

export default function SourceModal({ sourceType }: SourceModalProps) {
    const companyId = useDataStore.use.currentCompany();

    const sources = useTransactionStore.use.sources();
    const addSource = useTransactionStore.use.addSource();
    const removeSource = useTransactionStore.use.removeSource();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [currentId, setCurrentId] = useState("");

    const { mutate: mutateCreateSource, isPending: isCreatingSource } = useQueryAction<
        SourceSchemaType,
        RequestResponse<SourceType>
    >(createSource, () => { }, "source");

    const {
        mutate: mutateRemoveSource,
        isPending: isRemovingSource,
    } = useQueryAction<{ sourceId: string }, RequestResponse<SourceType>>(
        deleteSource,
        () => { },
        "source"
    );

    function retrieveSource(
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        id: string
    ) {
        e.stopPropagation();
        e.preventDefault();
        if (!id) return toast.error("Aucun identifiant trouvé.");
        setCurrentId(id);

        mutateRemoveSource(
            { sourceId: id },
            {
                onSuccess(data) {
                    if (data.data) {
                        removeSource(data.data.id);
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
        if (!name) return toast.error("Aucune source insérée.");
        if (!sourceType) return toast.error("Veuillez sélectionner le mode de paiement avant.");
        mutateCreateSource(
            { name, companyId, sourceType },
            {
                onSuccess(data) {
                    if (data.data) {
                        addSource(data.data);
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
                    <PlusCircle className="fill-white stroke-blue !w-6 !h-6" />Source
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter une source</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="">
                    <ScrollArea className="h-[200px]">
                        <ul>
                            {sources.length === 0 ? (
                                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                                    Aucune source trouvée.
                                </li>
                            ) : (
                                sources.map((source) => (
                                    <li
                                        key={source.id}
                                        className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                                    >
                                        {source.name}{" "}
                                        <div className="flex items-center gap-x-2">
                                            <span
                                                onClick={(e) =>
                                                    retrieveSource(e, source.id)
                                                }
                                                className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                                            >
                                                <XIcon className="w-[13px] h-[13px]" />
                                            </span>{" "}
                                            {currentId === source.id &&
                                                isRemovingSource && <Spinner size={10} />}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </ScrollArea>
                    <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
                        <TextInput
                            design="float"
                            label="Source de la transaction"
                            value={name}
                            handleChange={(e) => setName(e as string)}
                        />
                        <Button
                            onClick={submit}
                            variant="primary"
                            disabled={isCreatingSource || isRemovingSource}
                        >
                            {isCreatingSource ? <Spinner /> : "Ajouter"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
