import { TableActionButtonType } from "@/types/table.types";
import { EditIcon, Trash2Icon } from "lucide-react";

export const dropdownMenu: TableActionButtonType[] = [
    {
        id: 1,
        icon: EditIcon,
        title: "Modifier",
        action: "update"
    },
    {
        id: 2,
        icon: Trash2Icon,
        title: "Supprimer",
        action: "delete"
    },
]