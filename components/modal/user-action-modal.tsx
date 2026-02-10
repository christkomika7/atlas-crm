import { all as getAllSuppliers } from "@/action/supplier.action";
import { all as getAllClients } from "@/action/client.action";
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
import TextInput from "@/components/ui/text-input";
import useQueryAction from "@/hook/useQueryAction";
import { $Enums } from "@/lib/generated/prisma";
import { UserActionSchemaType } from "@/lib/zod/transaction.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { SupplierType } from "@/types/supplier.types";
import { UserActionType } from "@/types/transaction.type";
import { PlusCircle, XIcon } from "lucide-react";
import { Activity, useEffect, useState } from "react";
import { toast } from "sonner";
import { ClientType } from "@/types/client.types";
import { Combobox } from "../ui/combobox";


type userActionProps = {
    natureId: string;
    type: $Enums.UserActionType;
}

export default function userAction({ natureId, type }: userActionProps) {
    const companyId = useDataStore.use.currentCompany();

    const userActions = useTransactionStore.use.userActions();
    const addUserAction = useTransactionStore.use.addUserAction();
    const removeUserAction = useTransactionStore.use.removeUserAction();
    const [clients, setClients] = useState<ClientType[]>([]);
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");

    const [open, setOpen] = useState(false);
    const [currentId, setCurrentId] = useState("");

    const { mutate: mutateCreateUserAction, isPending: isCreatingUserAction } = useQueryAction<
        UserActionSchemaType,
        RequestResponse<UserActionType>
    >(createUserAction, () => { }, "user-action");

    const {
        mutate: mutateGetSuppliers,
        isPending: isGettingSuppliers,
    } = useQueryAction<{ id: string }, RequestResponse<SupplierType[]>>(
        getAllSuppliers,
        () => { },
        "suppliers"
    );

    const {
        mutate: mutateGetClients,
        isPending: isGettingClients,
    } = useQueryAction<{ id: string }, RequestResponse<ClientType[]>>(
        getAllClients,
        () => { },
        "clients"
    );

    const {
        mutate: mutateRemoveUserAction,
        isPending: isRemovingUserAction,
    } = useQueryAction<{ userActionId: string }, RequestResponse<UserActionType>>(
        deleteUserAction,
        () => { },
        "user-action"
    );


    useEffect(() => {
        mutateGetClients({ id: companyId }, {
            onSuccess(data) {
                setClients(data.data || []);
            },
        });

        mutateGetSuppliers({ id: companyId }, {
            onSuccess(data) {
                setSuppliers(data.data || []);
            },
        });

    }, [type, companyId])

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
                        setSelectedClient("");
                        setSelectedSupplier("");
                    }
                },
            }
        );
    }

    function submit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        e.preventDefault();

        if (!companyId) return toast.error("Aucune entreprise trouvée.");
        if (!type) return toast.error("Aucun type trouvé.");
        if (!natureId) return toast.error("Aucune nature est trouvée.");

        if (type === "CLIENT") {
            if (!selectedClient) return toast.error("Aucun client sélectionné.");
        }
        if (type === "SUPPLIER") {
            if (!selectedSupplier) return toast.error("Aucun fournisseur sélectionné.");
        }

        mutateCreateUserAction(
            { companyId, natureId, type, clientOrSupplierId: type === "CLIENT" ? selectedClient : selectedSupplier },
            {
                onSuccess(data) {
                    if (data.data) {
                        addUserAction(data.data);
                        setSelectedClient("");
                        setSelectedSupplier("");
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
                    <PlusCircle className="fill-white stroke-blue w-6! h-6!" /> Ajouter un {type === "CLIENT" ? "client" : "fournisseur"}
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
                                        {`${userAction.type === "CLIENT" ? `${userAction?.client?.lastname} ${userAction?.client?.firstname}` : `${userAction?.supplier?.lastname} ${userAction?.supplier?.firstname}`}`}
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
                        <Activity mode={type === "CLIENT" ? "visible" : "hidden"}>
                            <Combobox
                                required={false}
                                datas={clients.map(client => ({ id: client.id, label: `${client.lastname} ${client.firstname}`, value: client.id }))}
                                value={selectedClient}
                                isLoading={isGettingClients}
                                setValue={setSelectedClient}
                                placeholder="Client"
                                searchMessage="Rechercher un client"
                                noResultsMessage="Aucun client trouvé."
                            />
                        </Activity>
                        <Activity mode={type === "SUPPLIER" ? "visible" : "hidden"}>
                            <Combobox
                                required={false}
                                datas={suppliers.map(supplier => ({ id: supplier.id, label: `${supplier.lastname} ${supplier.firstname}`, value: supplier.id }))}
                                value={selectedSupplier}
                                isLoading={isGettingSuppliers}
                                setValue={setSelectedSupplier}
                                placeholder="Fournisseur"
                                searchMessage="Rechercher un fournisseur"
                                noResultsMessage="Aucun fournisseur trouvé."
                            />
                        </Activity>
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
