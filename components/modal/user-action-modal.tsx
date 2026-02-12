import { createUserAction, deleteUserAction } from "@/action/transaction.action";
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
import useQueryAction from "@/hook/useQueryAction";
import { UserActionSchemaType } from "@/lib/zod/transaction.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { UserActionType } from "@/types/transaction.type";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TextInput from "../ui/text-input";


type userActionProps = {
    natureId: string;
    type: "CLIENT" | "SUPPLIER";
}

export default function userAction({ natureId, type }: userActionProps) {
    const companyId = useDataStore.use.currentCompany();

    const userActions = useTransactionStore.use.userActions();
    const addUserAction = useTransactionStore.use.addUserAction();
    const removeUserAction = useTransactionStore.use.removeUserAction();
    const [name, setName] = useState("");


    const [open, setOpen] = useState(false);
    const [currentId, setCurrentId] = useState("");

    const { mutate: mutateCreateUserAction, isPending: isCreatingUserAction } = useQueryAction<
        UserActionSchemaType,
        RequestResponse<UserActionType>
    >(createUserAction, () => { }, "user-action");

    const {
        mutate: mutateRemoveUserAction,
        isPending: isRemovingUserAction,
    } = useQueryAction<{ userActionId: string }, RequestResponse<UserActionType>>(
        deleteUserAction,
        () => { },
        "user-action"
    );

    function retrieveUserAction(
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        id: string
    ) {
        e.stopPropagation();
        e.preventDefault();
        if (!id) return toast.error("Aucun identifiant trouvé.");
        setCurrentId(id);

        mutateRemoveUserAction(
            { userActionId: id },
            {
                onSuccess(data) {
                    if (data.data) {
                        removeUserAction(data.data.id);
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
        if (!natureId) return toast.error("Aucune nature est trouvée.");
        if (!name) return toast.error("Aucun nom trouvé.");


        mutateCreateUserAction(
            { companyId, natureId, name },
            {
                onSuccess(data) {
                    if (data.data) {
                        addUserAction(data.data);
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
                    className="h-9! font-medium"
                >
                    <PlusCircle className="fill-white stroke-blue w-6! h-6!" /> Ajouter un {type === "CLIENT" ? "client | tiers" : "fournisseur | tiers"}
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter un {type === "CLIENT" ? "client" : "fournisseur"}</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="">
                    <ScrollArea className="h-50">
                        <ul>
                            {userActions.length === 0 ? (
                                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                                    Aucun {type === "CLIENT" ? "client" : "fournisseur"} trouvé.
                                </li>
                            ) : (
                                userActions?.map((userAction) => (
                                    <li
                                        key={userAction.id}
                                        className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                                    >
                                        {userAction.name}
                                        <div className="flex items-center gap-x-2">
                                            <span
                                                onClick={(e) =>
                                                    retrieveUserAction(e, userAction.id)
                                                }
                                                className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                                            >
                                                <XIcon className="w-3.25 h-3.25" />
                                            </span>{" "}
                                            {currentId === userAction.id &&
                                                isRemovingUserAction && <Spinner size={10} />}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </ScrollArea>
                    <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
                        <TextInput
                            design="float"
                            label={`valeur du ${type === "CLIENT" ? "client | tiers" : "fournisseur | tiers"}`}
                            value={name}
                            handleChange={(e) => setName(e as string)}
                        />
                        <Button
                            onClick={submit}
                            variant="primary"
                            disabled={isCreatingUserAction || isRemovingUserAction}
                        >
                            {isCreatingUserAction ? <Spinner /> : "Ajouter"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
