import { TabType } from "@/types/tab.types";
import InvoiceTab from "./invoice-tab";
import QuoteTab from "./quote-tab";
import DeliveryNoteTab from "./delivery-note-tab";
import CreditNoteTab from "./credit-note-tab";
import PurchaseOrderTab from "./purchase-order-tab";
import ProjectTab from "./project-tab";
import ClientTab from "./client-tab";
import SupplierTab from "./supplier-tab";

export const tabs: TabType[] = [
  {
    id: 1,
    title: "Invoice",
    content: <InvoiceTab />,
  },
  {
    id: 2,
    title: "Quote",
    content: <QuoteTab />,
  },
  {
    id: 3,
    title: "Delivery Notes",
    content: <DeliveryNoteTab />,
  },
  {
    id: 4,
    title: "Credit Note",
    content: <CreditNoteTab />,
  },
  {
    id: 5,
    title: "Purchase Order",
    content: <PurchaseOrderTab />,
  },
  {
    id: 6,
    title: "Project",
    content: <ProjectTab />,
  },
  {
    id: 7,
    title: "Client",
    content: <ClientTab />,
  },
  {
    id: 8,
    title: "Supplier",
    content: <SupplierTab />,
  },
];
