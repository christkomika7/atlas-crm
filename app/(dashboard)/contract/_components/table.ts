import { TableActionButtonType } from "@/types/table.types";
import { ClipboardList, HandshakeIcon, Trash2Icon } from "lucide-react";

export const dropdownMenu: TableActionButtonType[] = [
    {
        id: 1,
        icon: HandshakeIcon,
        title: "Export Client",
        action: "convert"
    },
    {
        id: 2,
        icon: ClipboardList,
        title: "Export Lessor",
        action: "duplicate"
    },
    {
        id: 3,
        icon: Trash2Icon,
        title: "Supprimer",
        action: "delete"
    },
]