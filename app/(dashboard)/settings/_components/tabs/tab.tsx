import { TabType } from "@/types/tab.types";
import CompaniesTab from "./companies-tab";
import DatabaseTab from "./database-tab";
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
    title: "Base de données",
    content: <DatabaseTab />,
  },
  {
    id: 3,
    title: "Gestion des documents",
    content: <DocumentTab />,
  },
  {
    id: 4,
    title: "Exportation des données",
    content: <ExportTab />,
  },
  {
    id: 5,
    title: "Suppression",
    content: <DeletionTab />,
  },
];
