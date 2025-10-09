import { TabType } from "@/types/tab.types";
import ActivityTab from "./activity-tab";
import InfoTab from "./info-tab";

export const tabs: TabType[] = [
  {
    id: 1,
    title: "Activité",
    content: <ActivityTab />,
  },
  {
    id: 2,
    title: "Information",
    content: <InfoTab />,
  },
];
