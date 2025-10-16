import { TableActionButtonType } from "@/types/table.types";
import { CheckCheckIcon, CopyIcon, EditIcon, FilesIcon, PlusIcon, ScanEyeIcon, SendHorizonalIcon, Trash2Icon } from "lucide-react";

export const dropdownMenu: TableActionButtonType[] = [
    {
        id: "send",
        icon: SendHorizonalIcon,
        title: "Envoyer",
    },
    {
        id: "update",
        icon: EditIcon,
        title: "Modifier",
    },
    {
        id: "complete",
        icon: CheckCheckIcon,
        title: "Compléter",
    },
    {
        id: "preview",
        icon: ScanEyeIcon,
        title: "Aperçu",
    },
    {
        id: "duplicate",
        icon: CopyIcon,
        title: "Dupliquer",
    },
    {
        id: "convert",
        icon: FilesIcon,
        title: "Convertir",
    },
    {
        id: "delete",
        icon: Trash2Icon,
        title: "Supprimer",
    },
]