import { TableActionButtonType } from "@/types/table.types";
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";

export const dropdownMenu: TableActionButtonType[] = [
    {
        id: 1,
        icon: EyeIcon,
        title: "Visualiser",
        action: "infos"
    },
    {
        id: 2,
        icon: EditIcon,
        title: "Modifier",
        action: "update"
    },
    {
        id: 3,
        icon: Trash2Icon,
        title: "Supprimer",
        action: "delete"
    },
]