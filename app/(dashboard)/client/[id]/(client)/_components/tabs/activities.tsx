import { TabType } from "@/types/tab.types";
import InvoiceTab from "./invoice-tab";
import QuoteTab from "./quote-tab";
import DeliveryNotesTab from "./delivery-notes-tab";
import CreditNoteTab from "./credit-note-tab";

export const activities: TabType[] = [
  {
    id: 1,
    title: "Facture",
    content: <InvoiceTab />,
  },
  {
    id: 2,
    title: "Devis",
    content: <QuoteTab />,
  },
  {
    id: 3,
    title: "Bons de livraison",
    content: <DeliveryNotesTab />,
  },
  {
    id: 4,
    title: "Avoirs",
    content: <CreditNoteTab />,
  },
];
