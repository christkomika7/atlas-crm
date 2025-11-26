import { $Enums } from "@/lib/generated/prisma";
import React from "react";


const messages: Record<string, string> = {
  QUOTES: "Vous n'avez pas l'autorisation d'accéder aux devis.",
  INVOICES: "Vous n'avez pas l'autorisation d'accéder aux factures.",
  DELIVERY_NOTES: "Vous n'avez pas l'autorisation d'accéder aux bons de livraison.",
  PURCHASE_ORDERS: "Vous n'avez pas l'autorisation d'accéder aux bons de commande.",
  RECEIPTS: "Vous n'avez pas l'autorisation d'accéder aux reçus.",
  DISBURSEMENTS: "Vous n'avez pas l'autorisation d'accéder aux décaissements.",
  PRODUCT_SERVICES: "Vous n'avez pas l'autorisation d'accéder aux produits et services.",
  BILLBOARDS: "Vous n'avez pas l'autorisation d'accéder aux panneaux d'affichage.",
  CLIENTS: "Vous n'avez pas l'autorisation d'accéder aux clients.",
  SUPPLIERS: "Vous n'avez pas l'autorisation d'accéder aux fournisseurs.",
  PROJECTS: "Vous n'avez pas l'autorisation d'accéder aux projets.",
  CONTRACT: "Vous n'avez pas l'autorisation d'accéder aux contrats.",
  APPOINTMENTS: "Vous n'avez pas l'autorisation d'accéder aux rendez-vous.",
};

export default function NoAccess({ type }: { type: $Enums.Resource }) {
  const message = messages[type] || "Vous n'avez pas l'autorisation d'accéder à cette ressource.";

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center bg-red-50 border border-red-200 rounded-sm mx-auto">
      <div className="text-red-600 font-semibold">Accès refusé</div>
      <p className="text-red-700 text-sm mb-4">{message}</p>
    </div>
  );
}
