import { createCategory, deleteCategory } from "@/action/transaction.action";
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
import { CategorySchemaType } from "@/lib/zod/transaction.schema";
import { useDataStore } from "@/stores/data.store";
import useTransactionStore from "@/stores/transaction.store";
import { RequestResponse } from "@/types/api.types";
import { TransactionCategoryType } from "@/types/transaction.type";
import { PlusCircle, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CategoryModalProps = {
    type: "receipt" | "dibursement";
}

export default function CategoryModal({ type }: CategoryModalProps) {
    const companyId = useDataStore.use.currentCompany();

    const categories = useTransactionStore.use.categories();
    const addCategory = useTransactionStore.use.addCategory();
    const removeCategory = useTransactionStore.use.removeCategory();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [currentId, setCurrentId] = useState("");

    const { mutate: muatateCreateCategory, isPending: isCreatingCategory } = useQueryAction<
        CategorySchemaType,
        RequestResponse<TransactionCategoryType>
    >(createCategory, () => { }, "category");

    const {
        mutate: mutateRemoveCategory,
        isPending: isRemovingCategory,
    } = useQueryAction<{ categoryId: string }, RequestResponse<TransactionCategoryType>>(
        deleteCategory,
        () => { },
        "category"
    );

    function retrieveCategory(
        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
        id: string
    ) {
        e.stopPropagation();
        e.preventDefault();
        if (!id) return toast.error("Aucun identifiant trouvé.");
        setCurrentId(id);

        mutateRemoveCategory(
            { categoryId: id },
            {
                onSuccess(data) {
                    if (data.data) {
                        removeCategory(data.data.id);
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
        if (!name) return toast.error("Aucune catégorie insérée.");
        muatateCreateCategory(
            { name, companyId, type },
            {
                onSuccess(data) {
                    if (data.data) {
                        addCategory(data.data);
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
                    <PlusCircle className="fill-white stroke-blue w-6! h-6!" /> Ajouter un
                    Catégorie
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajouter une catégorie</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="">
                    <ScrollArea className="h-50">
                        <ul>
                            {categories.length === 0 ? (
                                <li className="bg-neutral-50 p-3 rounded-lg text-sm text-center">
                                    Aucune catégorie trouvée.
                                </li>
                            ) : (
                                categories.map((category) => (
                                    <li
                                        key={category.id}
                                        className="flex justify-between items-center gap-x-2 hover:bg-neutral-50 p-2 rounded-lg font-medium text-sm"
                                    >
                                        {category.name}{" "}
                                        <div className="flex items-center gap-x-2">
                                            <span
                                                onClick={(e) =>
                                                    retrieveCategory(e, category.id)
                                                }
                                                className="flex justify-center items-center bg-red/10 rounded-full w-5 h-5 text-red cursor-pointer"
                                            >
                                                <XIcon className="w-3.25 h-3.25" />
                                            </span>{" "}
                                            {currentId === category.id &&
                                                isRemovingCategory && <Spinner size={10} />}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </ScrollArea>
                    <div className="items-center gap-x-2 grid grid-cols-[3fr_1fr]">
                        <TextInput
                            design="float"
                            label="Catégorie de la transaction"
                            value={name}
                            handleChange={(e) => setName(e as string)}
                        />
                        <Button
                            onClick={submit}
                            variant="primary"
                            disabled={isCreatingCategory || isRemovingCategory}
                        >
                            {isCreatingCategory ? <Spinner /> : "Ajouter"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
