import { TabType } from "@/types/tab.types";
import EditRevenue from "./edit-revenue";
import PreviewRevenue from "./preview-revenue";

export const tabs: TabType[] = [
    {
        id: 1,
        title: "Modifier",
        content: <EditRevenue />,
    },
    {
        id: 2,
        title: "Aperçu",
        content: <PreviewRevenue />,
    }
];
