import { clsx, type ClassValue } from "clsx";
import { customAlphabet } from "nanoid";

import { twMerge } from "tailwind-merge";
import { $Enums, Action, Permission, Resource, Role } from "./generated/prisma";
import { UserEditSchemaType, UserSchemaType } from "./zod/user.schema";
import { PrefixType } from "@/types/document.types";
import { TransactionType } from "@/types/transaction.type";
import { DataListType } from "@/types/data.type";
import { ItemType, OmitItemType } from "@/types/item.type";
import { TaxItem } from "@/types/tax.type";
import Decimal from "decimal.js";
import { PurchaseItemType } from "@/stores/purchase-item.store";
import { INVOICE_PREFIX, PURCHASE_ORDER_PREFIX } from "@/config/constant";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeName(name?: string) {
  return (name ?? "").trim().toLowerCase();
}

export function generateId() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  return customAlphabet(alphabet, 7)();
}

export function cutText(name: string, limit?: number, isPoint = true) {
  const point = isPoint ? "..." : "";
  if (name.length > (limit || 15)) {
    return name.slice(0, limit || 15) + point;
  }
  return name;
}

export function getLabelByValue(lists: DataListType[], value: string): string {
  return lists.find((l) => l.value === value)?.label || value;
}


export function checkDeadline(dateStr: string | Date) {
  const targetDate = new Date(dateStr);
  const today = new Date();

  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    isOverdue: diffDays < 0,
    days: Math.abs(diffDays),
  };
}

export function getStatusName(status: $Enums.ProjectStatus) {
  switch (status) {
    case "TODO":
      return "À FAIRE";
    case "IN_PROGRESS":
      return "EN COUR";
    case "DONE":
      return "SUCCESS";
    case "BLOCKED":
      return "BLOQUÉ";
  }
}

export function calculatePrice(
  price: number,
  discount: number,
  type?: "purcent" | "money",
): number {
  let finalPrice = price;

  if (type === "purcent") {
    finalPrice = price - (price * discount) / 100;
  } else {
    finalPrice = price - discount;
  }

  return finalPrice;
}


export function formatNumber(value: string | number | Decimal): string {
  const str = value.toString().replace(/\s+/g, "");

  if (!/^-?\d+(\.\d+)?$/.test(str)) {
    throw new Error(
      "La valeur doit être un nombre valide (entier, décimal ou négatif)",
    );
  }

  const isNegative = str.startsWith("-");
  const absStr = isNegative ? str.slice(1) : str;

  const [integerPart, decimalPart] = absStr.split(".");

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const formattedNumber = decimalPart
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;

  return isNegative ? `-${formattedNumber}` : formattedNumber;
}

export function initialName(name: string): string {
  const splitName = name.trim().split(/\s+/).filter(Boolean);
  if (splitName.length === 0) return "";
  if (splitName.length === 1) {
    return splitName[0].slice(0, 2).toUpperCase();
  }
  return (
    splitName[0][0].toUpperCase() +
    splitName[splitName.length - 1][0].toUpperCase()
  );
}

export function getFirstValidCompanyId(items: any): string | null {
  console.log({ items })
  for (const item of items) {
    console.log({ item })
    if (item.company?.id) {
      return item.company.id;
    }
  }
  return null;
}



export function generateAmaId(id: number, withText: boolean = true) {
  if (withText) return `AMA-${String(id).padStart(3, "0")}`;
  return String(id).padStart(3, "0");
}

export async function urlToFile(path: string): Promise<File> {
  console.log({ urlToFile: path });

  try {
    // 1. Vérification basique du path
    if (!path || typeof path !== "string" || path.trim() === "") {
      throw new Error("Chemin de fichier invalide ou vide.");
    }

    // 2. Nettoyage du path
    const cleanedPath = path.trim();

    // 3. Vérifications de sécurité (pas de path traversal, ni de doublons de slash)
    if (cleanedPath.includes("..") || cleanedPath.includes("//")) {
      throw new Error("Chemin de fichier non autorisé.");
    }

    // 4. (Facultatif) Vérification de l’extension (ici un exemple basique)
    // const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".txt", ".docx"];
    // const hasAllowedExtension = allowedExtensions.some(ext => cleanedPath.toLowerCase().endsWith(ext));

    // if (!hasAllowedExtension) {
    //   throw new Error("Extension de fichier non autorisée.");
    // }

    // 5. Construction de l’URL et requête
    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/upload?path=${encodeURIComponent(cleanedPath)}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }

    const blob = await res.blob();
    const name = cleanedPath.split("/").pop() || "fichier_sans_nom";
    const type = res.headers.get("Content-Type") || "application/octet-stream";

    return new File([blob], name, { type });
  } catch (e) {
    console.error("Erreur urlToFile:", e);
    return new File([], "invalide", { type: "application/octet-stream" });
  }
}


export function getIdFromUrl(
  reqUrl: string,
  index: number | "last",
): string | null {
  const url = new URL(reqUrl);
  const parts = url.pathname.split("/").filter(Boolean);

  const idx = index === "last" ? parts.length - 1 : index;

  if (typeof idx !== "number" || idx < 0 || idx >= parts.length) {
    return null;
  }

  return parts[idx];
}

export function resolveImageSrc(
  file: string | File | undefined,
): string | null {
  if (!file) return null;

  try {
    if (typeof file === "string") {
      // Vérifie si c'est une URL valide (http(s) ou data: ou chemin local)
      try {
        new URL(file, window.location.origin);
        return file;
      } catch {
        return null;
      }
    }

    if (file instanceof File) {
      // Vérifie que ce n’est pas un fichier vide ou corrompu
      if (file.size === 0 || !file.type.startsWith("image/")) {
        return null;
      }
      return URL.createObjectURL(file);
    }

    return null;
  } catch {
    return null;
  }
}

export function extractCompanyData(formData: FormData) {
  const data: any = {};

  // Champs simples
  const simpleFields = [
    "companyName",
    "country",
    "registeredAddress",
    "phoneNumber",
    "city",
    "codePostal",
    "email",
    "website",
    "businessRegistrationNumber",
    "taxIdentificationNumber",
    "capitalAmount",
    "currency",
    "bankAccountDetails",
    "businessActivityType",
  ];

  simpleFields.forEach((field) => {
    const value = formData.get(field);
    if (value !== null) {
      data[field] = value.toString();
    }
  });

  try {
    // Vat rate
    const vatRateJson = formData.get("vatRate");
    if (vatRateJson) {
      data.vatRate = JSON.parse(vatRateJson.toString());
    }

    // Fiscal
    const fiscalJson = formData.get("fiscal");
    if (fiscalJson) {
      const fiscalData = JSON.parse(fiscalJson.toString());
      data.fiscal = {
        from: new Date(fiscalData.from),
        to: new Date(fiscalData.to),
      };
    }

    // Employees (avec image, passport et document)
    const employees: any[] = [];
    let index = 0;

    while (true) {
      const employeeJson = formData.get(`employees[${index}]`);
      if (!employeeJson) break;

      const parsed = JSON.parse(employeeJson.toString());

      console.log({ parsed })

      const image = formData.get(`images[${index}]`);
      if (image instanceof File) {
        parsed.image = image;
      }

      const passport = formData.get(`passport[${index}]`);
      if (passport instanceof File) {
        parsed.passport = passport;
      }

      const document = formData.get(`document[${index}]`);
      if (document instanceof File) {
        parsed.document = document;
      }

      employees.push({ ...parsed, salary: parsed.salary });
      index++;
    }

    data.employees = employees;
  } catch (error) {
    console.error(
      "Erreur lors du parsing JSON ou du traitement des fichiers:",
      error,
    );
    throw new Error("Données JSON ou fichiers invalides");
  }

  return data;
}

export function getFilePath(file: string) {
  return `/api/upload?path=${encodeURIComponent(file)}`;
}

export function downloadFile(url: string) {
  const fullUrl = `/api/upload?path=${encodeURIComponent(url)}`;
  const link = document.createElement("a");
  link.href = fullUrl;
  link.download = fullUrl.split("/").pop() || "document";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function hasPermission(
  role: Role,
  resources: $Enums.Resource[],
  action: $Enums.Action,
  userPermissions: Permission[],
  onlyAdmin: boolean = false,
  log = false,
): boolean {
  if (onlyAdmin) {
    const isAdmin = role === "ADMIN";
    if (log) {
      if (isAdmin) {
        console.log(
          `[PERMISSION] Accès réservé ADMIN autorisé (${resources.join(", ")})`,
        );
      } else {
        console.warn(
          `[PERMISSION] Accès refusé : seul ADMIN peut accéder à ${resources.join(", ")}`,
        );
      }
    }
    return isAdmin;
  }

  if (role === "ADMIN") {
    if (log)
      console.log(
        `[PERMISSION] ADMIN accès accordé à ${resources.join(", ")} (${action})`,
      );
    return true;
  }

  const actionHierarchy: Record<$Enums.Action, $Enums.Action[]> = {
    READ: ["READ", "MODIFY", "CREATE"],
    MODIFY: ["MODIFY", "CREATE"],
    CREATE: ["CREATE"],
  };

  const validActions = actionHierarchy[action] ?? [action];

  for (const resource of resources) {
    const permission = userPermissions?.find((p) => p.resource === resource);
    if (!permission) continue;

    if (permission.actions.some((a) => validActions.includes(a))) {
      if (log)
        console.log(
          `[PERMISSION] Accès autorisé: ${resource} (${action}) via ${permission.actions.join(", ")}`,
        );
      return true;
    }
  }

  if (log)
    console.warn(
      `[PERMISSION] Accès refusé: ${resources.join(", ")} (${action})`,
    );
  return false;
}

export function isRestrictedToAdminPath(
  isAdmin: boolean,
  adminOnlyPaths: string[],
  currentPath: string,
): boolean {
  if (isAdmin) return true;

  for (const adminPath of adminOnlyPaths) {
    const regexPath = adminPath
      .split("/")
      .map((segment) => (segment.startsWith(":") ? "[^/]+" : segment))
      .join("/");

    const regex = new RegExp(`^${regexPath}$`);
    if (regex.test(currentPath)) {
      return false; // Accès refusé car ce chemin est réservé aux admins
    }
  }

  return true; // Accès autorisé car ce chemin n'est pas restreint
}

export function sanitize(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

export function validateMimeType(
  file: File,
  acceptedTypes: readonly string[],
): boolean {
  return acceptedTypes.includes(file.type);
}

export function getFileExtension(name: string, fallback = ".jpg") {
  if (name.endsWith(".pdf")) return ".pdf";
  if (name.endsWith(".jpeg") || name.endsWith(".jpg")) return ".jpg";
  if (name.endsWith(".png")) return ".png";
  return fallback;
}

export function createPermissionsData(
  user: UserSchemaType | UserEditSchemaType,
) {
  return [
    {
      resource: Resource.DASHBOARD,
      actions: [
        user.dashboard?.read ? Action.READ : null,
        user.dashboard?.edit ? Action.MODIFY : null,
        user.dashboard?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.CLIENTS,
      actions: [
        user.clients?.read ? Action.READ : null,
        user.clients?.edit ? Action.MODIFY : null,
        user.clients?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.SUPPLIERS,
      actions: [
        user.suppliers?.read ? Action.READ : null,
        user.suppliers?.edit ? Action.MODIFY : null,
        user.suppliers?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.INVOICES,
      actions: [
        user.invoices?.read ? Action.READ : null,
        user.invoices?.edit ? Action.MODIFY : null,
        user.invoices?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.QUOTES,
      actions: [
        user.quotes?.read ? Action.READ : null,
        user.quotes?.edit ? Action.MODIFY : null,
        user.quotes?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.DELIVERY_NOTES,
      actions: [
        user.deliveryNotes?.read ? Action.READ : null,
        user.deliveryNotes?.edit ? Action.MODIFY : null,
        user.deliveryNotes?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.PURCHASE_ORDER,
      actions: [
        user.purchaseOrder?.read ? Action.READ : null,
        user.purchaseOrder?.edit ? Action.MODIFY : null,
        user.purchaseOrder?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.CREDIT_NOTES,
      actions: [
        user.creditNotes?.read ? Action.READ : null,
        user.creditNotes?.edit ? Action.MODIFY : null,
        user.creditNotes?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.PRODUCT_SERVICES,
      actions: [
        user.productServices?.read ? Action.READ : null,
        user.productServices?.edit ? Action.MODIFY : null,
        user.productServices?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.BILLBOARDS,
      actions: [
        user.billboards?.read ? Action.READ : null,
        user.billboards?.edit ? Action.MODIFY : null,
        user.billboards?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.PROJECTS,
      actions: [
        user.projects?.read ? Action.READ : null,
        user.projects?.edit ? Action.MODIFY : null,
        user.projects?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.APPOINTMENT,
      actions: [
        user.appointment?.read ? Action.READ : null,
        user.appointment?.edit ? Action.MODIFY : null,
        user.appointment?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.TRANSACTION,
      actions: [
        user.transaction?.read ? Action.READ : null,
        user.transaction?.edit ? Action.MODIFY : null,
        user.transaction?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
    {
      resource: Resource.SETTING,
      actions: [
        user.setting?.read ? Action.READ : null,
        user.setting?.edit ? Action.MODIFY : null,
        user.setting?.create ? Action.CREATE : null,
      ].filter((a): a is Action => a !== null),
    },
  ].filter((permission) => permission.actions.length > 0); // Ne créer que les permissions avec des actions
}

export function formatMonthsToYears(months: number): string {
  if (months < 0) throw new Error("Le nombre de mois doit être positif");

  if (months === 0) return "0 mois";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  let result = "";

  if (years > 0) {
    result += years + " " + (years > 1 ? "ans" : "an");
  }

  if (remainingMonths > 0) {
    if (years > 0) result += " & ";
    result += remainingMonths + " mois";
  }

  return result;
}

// await generateAndDownloadPDF({
//   baseUrl: env.NEXT_PUBLIC_BETTER_AUTH_URL,
//   resourcePath: "admin/real-state/export",
//   apiConvertPath: "api/realstate/convert",
//   resourceId: query.data.data.id,
//   fileName: `${query.data.data.title}.pdf`,
//   toast,
//   setIsLoading,
// });

export async function generateAndDownloadPDF(params: {
  resourcePath: string; // chemin relatif API, ex: "billboard/contract"
  apiConvertPath: string; // chemin API de conversion, ex: "api/convert"
  fileName: string; // nom du fichier PDF à générer
  toast: {
    loading: (msg: string) => string;
    success: (msg: string, options: { id: string }) => void;
    error: (msg: string, options: { id: string }) => void;
  };
  setIsLoading: (loading: boolean) => void;
}) {
  const { resourcePath, apiConvertPath, fileName, toast, setIsLoading } =
    params;

  const toastId = toast.loading("Génération du PDF en cours...");

  try {
    setIsLoading(true);

    // Construire l'URL complète de la page à capturer
    const baseUrl = process.env.NEXT_PUBLIC_AUTH_URL || window.location.origin;
    const fullResourceUrl = `${baseUrl}/${resourcePath}`;

    console.log("URL de la ressource:", fullResourceUrl);

    // Encoder l'URL pour la passer en paramètre
    const encodedUrl = encodeURIComponent(fullResourceUrl);

    // Construire l'URL de l'API de conversion
    const apiUrl = `${baseUrl}/${apiConvertPath}?url=${encodedUrl}`;

    console.log("URL de l'API:", apiUrl);

    // Faire la requête avec un timeout plus long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes

    const res = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        // Transférer les cookies de la session actuelle
        Cookie: document.cookie,
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Erreur de l'API:", errorText);
      throw new Error(
        `Échec de la génération du PDF: ${res.status} ${res.statusText}`,
      );
    }

    const blob = await res.blob();

    // Vérifier que c'est bien un PDF
    if (!blob.type.includes("pdf")) {
      console.error("Type de fichier reçu:", blob.type);
      throw new Error("Le serveur n'a pas retourné un fichier PDF valide");
    }

    // Télécharger le fichier
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = fileName;

    // Assurer que le lien est ajouté au DOM pour certains navigateurs
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Nettoyer l'URL d'objet
    URL.revokeObjectURL(url);

    toast.success("PDF généré avec succès !", { id: toastId });
  } catch (err: any) {
    console.error("Erreur lors de la génération du PDF:", err);

    let errorMessage = "Erreur lors de la génération du PDF.";

    if (err.name === "AbortError") {
      errorMessage =
        "La génération du PDF a pris trop de temps. Veuillez réessayer.";
    } else if (err.message.includes("Failed to fetch")) {
      errorMessage =
        "Impossible de contacter le serveur. Vérifiez votre connexion.";
    } else if (err.message) {
      errorMessage = err.message;
    }

    toast.error(errorMessage, { id: toastId });
  } finally {
    setIsLoading(false);
  }
}

// Fonction utilitaire pour déboguer les éléments présents sur la page
export async function debugPageElements(resourcePath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_AUTH_URL || window.location.origin;
  const fullResourceUrl = `${baseUrl}/${resourcePath}`;

  try {
    const response = await fetch(
      `${baseUrl}/api/debug-page?url=${encodeURIComponent(fullResourceUrl)}`,
    );
    const debug = await response.json();
    console.log("Debug de la page:", debug);
    return debug;
  } catch (error) {
    console.error("Erreur lors du débogage:", error);
    return null;
  }
}

export function getPrefix(
  itemType: $Enums.ItemInvoiceType,
  prefixs: PrefixType,
): string {
  switch (itemType) {
    case "INVOICES":
      return prefixs.invoices;
    case "QUOTES":
      return prefixs.quotes;
    case "PURCHASE_ORDERS":
      return prefixs.purchaseOrders;
    case "DELIVERY_NOTES":
      return prefixs.deliveryNotes;
    case "CREDIT_NOTES":
      return prefixs.creditNotes;
    default:
      return "";
  }
}

export function getDocumentRef(transaction: TransactionType) {
  if (transaction.type === "RECEIPT") {
    if (transaction.referenceInvoiceId) {
      return `${transaction.company.documentModel.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(transaction.referenceInvoice.invoiceNumber, false)}`;
    }
  } else {
    if (transaction.referencePurchaseOrderId) {
      return `${transaction.company.documentModel.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(transaction.referencePurchaseOrder.purchaseOrderNumber, false)}`;
    }
  }

}



export function parsePurchaseItem(item: Omit<PurchaseItemType, OmitItemType>): TaxItem {
  return {
    hasTax: item.hasTax,
    name: item.name as string,
    price: new Decimal(item.price),
    discountType: item.discountType as "purcent" | "money",
    discount: Number(String(item.discount ?? 0).replace("%", "")),
    quantity: item.selectedQuantity as number,
  }
}


export function parsePurchaseItems(items: Omit<PurchaseItemType, OmitItemType>[]): TaxItem[] {
  return items.map(item => ({
    hasTax: item.hasTax,
    name: item.name as string,
    price: new Decimal(item.price),
    discountType: item.discountType as "purcent" | "money",
    discount: Number(String(item.discount ?? 0).replace("%", "")),
    quantity: item.selectedQuantity as number,
  }))
}


export function parseItem(item: Omit<ItemType, OmitItemType>): TaxItem {
  return {
    name: item.name as string,
    hasTax: item.hasTax,
    price: new Decimal(item.price),
    discountType: item.discountType as "purcent" | "money",
    discount: Number(String(item.discount ?? 0).replace("%", "")),
    quantity: item.quantity as number,
  }
}

export function parseItems(items: Omit<ItemType, OmitItemType>[]): TaxItem[] {
  return items.map(item => ({
    name: item.name as string,
    hasTax: item.hasTax,
    price: new Decimal(item.price),
    discountType: item.discountType as "purcent" | "money",
    discount: Number(String(item.discount ?? 0).replace("%", "")),
    quantity: item.quantity as number,
  }))
}

export function getAmountPrice(amountType: 'HT' | "TTC", TTCPrice?: Decimal, HTPrice?: Decimal) {
  const ttc = TTCPrice || new Decimal(0);
  const ht = HTPrice || new Decimal(0);
  return amountType === "HT" ? ht : ttc;
}