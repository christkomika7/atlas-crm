import { TableActionButtonType } from "@/types/table.types";
import { ClipboardList, EditIcon, HandshakeIcon, Trash2Icon } from "lucide-react";

export const dropdownMenu: TableActionButtonType[] = [
    {
        id: 1,
        icon: EditIcon,
        title: "Modifier",
        action: "update"
    },
    {
        id: 2,
        icon: HandshakeIcon,
        title: "Exporter le contrat",
        action: "convert"
    },
    {
        id: 3,
        icon: ClipboardList,
        title: "Exporter le contrat",
        action: "duplicate"
    },
    {
        id: 4,
        icon: Trash2Icon,
        title: "Supprimer",
        action: "delete"
    },
]