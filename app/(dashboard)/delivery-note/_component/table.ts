import { TableActionButtonType } from "@/types/table.types";
import { CheckCheckIcon, CopyIcon, EditIcon, FilesIcon, PlusIcon, ScanEyeIcon, SendHorizonalIcon, Trash2Icon } from "lucide-react";

export const dropdownMenu: TableActionButtonType[] = [
    {
        id: 1,
        icon: SendHorizonalIcon,
        title: "Envoyer",
        action: "send"
    },
    {
        id: 2,
        icon: EditIcon,
        title: "Modifier",
        action: "update"
    },
    {
        id: 3,
        icon: CheckCheckIcon,
        title: "Compléter",
        action: "complete"
    },
    {
        id: 4,
        icon: ScanEyeIcon,
        title: "Aperçu",
        action: 'infos'
    },
    {
        id: 5,
        icon: CopyIcon,
        title: "Dupliquer",
        action: "duplicate"
    },
    {
        id: 6,
        icon: FilesIcon,
        title: "Convertir",
        action: "convert"
    },
    {
        id: 7,
        icon: Trash2Icon,
        title: "Supprimer",
        action: "delete"
    },
]