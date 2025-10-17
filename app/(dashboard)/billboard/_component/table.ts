import { TableActionButtonType } from "@/types/table.types";
import { EditIcon, FileTextIcon, InfoIcon, Layers2Icon, Trash2Icon } from "lucide-react";

export const dropdownMenu: TableActionButtonType[] = [
    {
        id: 1,
        action: "infos",
        icon: InfoIcon,
        title: "Infos",
    },
    {
        id: 2,
        action: "duplicate",
        icon: Layers2Icon,
        title: "Dupliquer",
    },
    {
        id: 3,
        action: "update",
        icon: EditIcon,
        title: "Modifier",
    },
    {
        id: 4,
        action: "delete",
        icon: Trash2Icon,
        title: "Supprimer",
    },
]