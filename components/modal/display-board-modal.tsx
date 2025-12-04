import { createBillboardElement, removeBillboardElements } from "@/action/billboard.action";
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
import { BaseSchemaType } from "@/lib/zod/base-type.schema";
import useBillboardStore from "@/stores/billboard.store";
import { useDataStore } from "@/stores/data.store";
import { RequestResponse } from "@/types/api.types";
import { BaseType } from "@/types/base.types";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DisplayBoardModal() {
    const companyId = useDataStore.use.currentCompany();

    const datas = useBillboardStore.use.displayBoards();
    const addData = useBillboardStore.use.addDisplayBoard();
    const removeData = useBillboardStore.use.removeDisplayBoard();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [currentId, setCurrentId] = useState("");

    const { mutate: muatateCreateElement, isPending: isCreatingElement } = useQueryAction<
        BaseSchemaType & { type: "display-board" | "lessor-type" | "structure-type", lessorSpace?: "private" | "public" },
        RequestResponse<BaseType>
    >(createBillboardElement, () => { }, "element");

    const {
        mutate: mutateRemoveElement,
        isPending: isRemovingElement,
    } = useQueryAction<{ id: string, type: "display-board" | "lessor-type" | "structure-type" }, RequestResponse<BaseType>>(
        removeBillboardElements,
        () => { },
        "element"
    );

    function retrieveElement(
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        id: string
    ) {
        e.stopPropagation();
        e.preventDefault();
        if (!id) return toast.error("Aucun identifiant trouvé.");
        setCurrentId(id);

        mutateRemoveElement(
            { id, type: "display-board" },
            {
                onSuccess(data) {
                    if (data.data) {
                        removeData(data.data.id);
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
        if (!name) return toast.error("Aucune élément insérée.");
        muatateCreateElement(
            { name, companyId, type: "display-board" },
            {
                onSuccess(data) {
                    if (data.data) {
                        addData(data.data);
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
                    <PlusCircle className="fill-white stroke-blue !w-6 !h-6" /> Support d'affichage
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter un support d'affichage</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="">
                    <ScrollArea className="h-[200px]">
                        <ul>
                            {datas.length === 0 ? (
                                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                                    Aucune valeur trouvée.
                                </li>
                            ) : (
                                datas.map((data) => (
                                    <li
                                        key={data.id}
                                        className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                                    >
                                        {data.name}{" "}
                                        <div className="flex items-center gap-x-2">
                                            <span
                                                onClick={(e) =>
                                                    retrieveElement(e, data.id)
                                                }
                                                className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                                            >
                                                <XIcon className="w-[13px] h-[13px]" />
                                            </span>{" "}
                                            {currentId === data.id &&
                                                isRemovingElement && <Spinner size={10} />}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </ScrollArea>
                    <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
                        <TextInput
                            design="float"
                            label="Support d'affichage"
                            value={name}
                            handleChange={(e) => setName(e as string)}
                        />
                        <Button
                            onClick={submit}
                            variant="primary"
                            disabled={isCreatingElement || isRemovingElement}
                        >
                            {isCreatingElement ? <Spinner /> : "Ajouter"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
