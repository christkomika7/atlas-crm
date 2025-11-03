import { TableActionButtonType } from "@/types/table.types";
import { CopyIcon, EditIcon, Trash2Icon } from "lucide-react";

export const dropdownMenu: TableActionButtonType[] = [
    {
        id: 1,
        icon: CopyIcon,
        title: "Dupliquer",
        action: "duplicate",
    },
    {
        id: 2,
        icon: EditIcon,
        title: "Modifier",
    },
    {
        id: 3,
        icon: Trash2Icon,
        title: "Supprimer",
        action: "delete"
    },
]