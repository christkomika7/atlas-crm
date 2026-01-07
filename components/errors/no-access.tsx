export enum NoAccessResource {
  QUOTES = "QUOTES",
  INVOICES = "INVOICES",
  DELIVERY_NOTES = "DELIVERY_NOTES",
  PURCHASE_ORDERS = "PURCHASE_ORDERS",
  RECEIPTS = "RECEIPTS",
  DISBURSEMENTS = "DISBURSEMENTS",
  PRODUCT_SERVICES = "PRODUCT_SERVICES",
  BILLBOARDS = "BILLBOARDS",
  CLIENTS = "CLIENTS",
  SUPPLIERS = "SUPPLIERS",
  PROJECTS = "PROJECTS",
  CONTRACT = "CONTRACT",
  APPOINTMENTS = "APPOINTMENTS",
  NO_PROJECT = "NO_PROJECT",
}


const messages: Record<NoAccessResource, string> = {
  [NoAccessResource.QUOTES]: "Vous n'avez pas l'autorisation d'accéder aux devis.",
  [NoAccessResource.INVOICES]: "Vous n'avez pas l'autorisation d'accéder aux factures.",
  [NoAccessResource.DELIVERY_NOTES]: "Vous n'avez pas l'autorisation d'accéder aux bons de livraison.",
  [NoAccessResource.PURCHASE_ORDERS]: "Vous n'avez pas l'autorisation d'accéder aux bons de commande.",
  [NoAccessResource.RECEIPTS]: "Vous n'avez pas l'autorisation d'accéder aux reçus.",
  [NoAccessResource.DISBURSEMENTS]: "Vous n'avez pas l'autorisation d'accéder aux décaissements.",
  [NoAccessResource.PRODUCT_SERVICES]: "Vous n'avez pas l'autorisation d'accéder aux produits et services.",
  [NoAccessResource.BILLBOARDS]: "Vous n'avez pas l'autorisation d'accéder aux panneaux d'affichage.",
  [NoAccessResource.CLIENTS]: "Vous n'avez pas l'autorisation d'accéder aux clients.",
  [NoAccessResource.SUPPLIERS]: "Vous n'avez pas l'autorisation d'accéder aux fournisseurs.",
  [NoAccessResource.PROJECTS]: "Vous n'avez pas l'autorisation d'accéder aux projets.",
  [NoAccessResource.CONTRACT]: "Vous n'avez pas l'autorisation d'accéder aux contrats.",
  [NoAccessResource.APPOINTMENTS]: "Vous n'avez pas l'autorisation d'accéder aux rendez-vous.",
  [NoAccessResource.NO_PROJECT]: "Aucun projet sélectionné. Veuillez sélectionner un projet pour continuer.",
};


export default function NoAccess({ type }: { type: NoAccessResource }) {
  const message = messages[type] || "Vous n'avez pas l'autorisation d'accéder à cette ressource.";

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center bg-red-50 border border-red-200 rounded-sm mx-auto">
      <div className="text-red-600 font-semibold">Accès refusé</div>
      <p className="text-red-700 text-sm mb-4">{message}</p>
    </div>
  );
}
