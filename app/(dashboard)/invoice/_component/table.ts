import { TableActionButtonType } from "@/types/table.types";
import { EditIcon, FilesIcon, PlusIcon, ScanEyeIcon, SendHorizonalIcon, Trash2Icon } from "lucide-react";

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
        id: "add",
        icon: PlusIcon,
        title: "Ajouter  paiement",
    },
    {
        id: "preview",
        icon: ScanEyeIcon,
        title: "Aperçu",
    },
    {
        id: "duplicate",
        icon: FilesIcon,
        title: "Dupliquer",
    },
    {
        id: "delete",
        icon: Trash2Icon,
        title: "Supprimer",
    },
]