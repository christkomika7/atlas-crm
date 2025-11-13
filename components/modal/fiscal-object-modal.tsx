import { createFiscalObject, deleteFiscalObject } from "@/action/transaction.action";
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
import { FiscalObjectSchemaType } from "@/lib/zod/transaction.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { FiscalObjectType } from "@/types/transaction.type";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";



export default function FiscalObjectModal() {
    const companyId = useDataStore.use.currentCompany();

    const fiscalObjects = useTransactionStore.use.fiscalObjects();
    const addFiscalObjectType = useTransactionStore.use.addFiscalObjectType();
    const removeFiscalObjectType = useTransactionStore.use.removeFiscalObjectType();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [currentId, setCurrentId] = useState("");

    const { mutate: muatateCreateFiscalObject, isPending: isCreatingFiscalObject } = useQueryAction<
        FiscalObjectSchemaType,
        RequestResponse<FiscalObjectType>
    >(createFiscalObject, () => { }, "fiscal-object");

    const {
        mutate: mutateRemoveFiscalObjectType,
        isPending: isRemovingFiscalObject,
    } = useQueryAction<{ fiscalObjectId: string }, RequestResponse<FiscalObjectType>>(
        deleteFiscalObject,
        () => { },
        "fiscal-object"
    );

    function retrieveFiscalObject(
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        id: string
    ) {
        e.stopPropagation();
        e.preventDefault();
        if (!id) return toast.error("Aucun identifiant trouvé.");
        setCurrentId(id);

        mutateRemoveFiscalObjectType(
            { fiscalObjectId: id },
            {
                onSuccess(data) {
                    if (data.data) {
                        removeFiscalObjectType(data.data.id);
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
        if (!name) return toast.error("Aucun objet inséré.");
        muatateCreateFiscalObject(
            { name, companyId },
            {
                onSuccess(data) {
                    if (data.data) {
                        addFiscalObjectType(data.data);
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
                    <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Objet du paiement
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter un objet</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="">
                    <ScrollArea className="h-[200px]">
                        <ul>
                            {fiscalObjects.length === 0 ? (
                                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                                    Aucun objet trouvé.
                                </li>
                            ) : (
                                fiscalObjects.map((fiscalObject) => (
                                    <li
                                        key={fiscalObject.id}
                                        className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                                    >
                                        {fiscalObject.name}{" "}
                                        <div className="flex items-center gap-x-2">
                                            <span
                                                onClick={(e) =>
                                                    retrieveFiscalObject(e, fiscalObject.id)
                                                }
                                                className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                                            >
                                                <XIcon className="w-[13px] h-[13px]" />
                                            </span>{" "}
                                            {currentId === fiscalObject.id &&
                                                isRemovingFiscalObject && <Spinner size={10} />}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </ScrollArea>
                    <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
                        <TextInput
                            design="float"
                            label="Objet du paiement"
                            value={name}
                            handleChange={(e) => setName(e as string)}
                        />
                        <Button
                            onClick={submit}
                            variant="primary"
                            disabled={isCreatingFiscalObject || isRemovingFiscalObject}
                        >
                            {isCreatingFiscalObject ? <Spinner /> : "Ajouter"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
