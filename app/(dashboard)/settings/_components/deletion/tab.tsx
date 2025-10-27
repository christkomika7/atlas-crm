import { TabType } from "@/types/tab.types";
import QuoteTab from "./quote-tab";
import InvoiceTab from "./invoice-tab";
import DeliveryNoteTab from "./delivery-note-tab";
import PurchaseOrderTab from "./purchase-order-tab";
import ReceiptTab from "./receipt-tab";
import DibursementTab from "./dibursement-tab";
import ProductTab from "./product-tab";
import BillboardTab from "./billboard-tab";
import ClientTab from "./client-tab";
import SupplierTab from "./supplier-tab";
import ProjectTab from "./project-tab";
import AppointmentTab from "./appointment-tab";


export const tabs: TabType[] = [
  {
    id: 1,
    title: "Devis",
    content: <QuoteTab />,
  },
  {
    id: 2,
    title: "Facture",
    content: <InvoiceTab />,
  },
  {
    id: 3,
    title: "BL",
    content: <DeliveryNoteTab />,
  },
  {
    id: 4,
    title: "BC",
    content: <PurchaseOrderTab />,
  },
  {
    id: 5,
    title: "Entrée",
    content: <ReceiptTab />,
  },
  {
    id: 6,
    title: "Sortie",
    content: <DibursementTab />,
  },
  {
    id: 7,
    title: "Produit",
    content: <ProductTab />,
  },
  {
    id: 8,
    title: "Panneau",
    content: <BillboardTab />,
  },
  {
    id: 9,
    title: "Client",
    content: <ClientTab />,
  },
  {
    id: 10,
    title: "Fournisseur",
    content: <SupplierTab />,
  },
  {
    id: 11,
    title: "Projet",
    content: <ProjectTab />,
  },
  {
    id: 12,
    title: "Rendez-vous",
    content: <AppointmentTab />,
  },
];
