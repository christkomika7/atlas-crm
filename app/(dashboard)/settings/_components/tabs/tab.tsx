import { TabType } from "@/types/tab.types";
import CompaniesTab from "./companies-tab";
import DeletionTab from "./deletion-tab";
import DocumentTab from "./document-tab";
import ExportTab from "./export-tab";

export const tabs: TabType[] = [
  {
    id: 1,
    title: "Entreprises",
    content: <CompaniesTab />,
  },
  {
    id: 2,
    title: "Gestion des documents",
    content: <DocumentTab />,
  },
  {
    id: 3,
    title: "Exportation des données",
    content: <ExportTab />,
  },
  {
    id: 4,
    title: "Suppression",
    content: <DeletionTab />,
  },
];
