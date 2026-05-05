import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export type TableActionButtonType = {
    id: number | string;
    icon: ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    title: string;
    action?: "default" | "delete" | "send" | "convert" | "download" | "update" | "add" | "infos" | "duplicate" | "complete";
};