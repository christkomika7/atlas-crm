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
import { website } from "@/config/website";
import { notFound } from "next/navigation";
import { compressToUTF16, decompressFromUTF16, } from "async-lz-string";
import { acceptPayment } from "./data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export async function compressString(value: string) {
  return await compressToUTF16(value)
}

export async function decompressString(value: string) {
  return await decompressFromUTF16(value)
}

export function formatList(items: string[]) {
  if (!items || items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} et ${items[1]}`;

  return items.slice(0, -1).join(", ") + " et " + items[items.length - 1];
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

export function addTotalRow(
  tableData: Record<string, any>[],
  columns: string[],
  currency: string
): Record<string, any> {
  const totalRow: Record<string, any> = {};

  columns.forEach((col, index) => {
    if (index === 0) {
      totalRow[col] = "Total";
      return;
    }

    let sum = 0;
    let hasNumeric = false;
    let hasCurrency = false;

    for (const row of tableData) {
      const value = row[col];
      if (value == null) continue;

      const valueStr = String(value);

      // 🔎 Détecte la devise
      if (valueStr.includes(currency)) {
        hasCurrency = true;
      }

      let numeric: number | null = null;

      // 🟢 CLEAN UNIQUEMENT SI devise présente
      if (valueStr.includes(currency)) {
        const cleaned = valueStr
          .replace(/\n/g, " ")          // enlève retours ligne
          .replace(currency, "")       // enlève la devise
          .replace(/[^\d ]/g, "")      // garde chiffres + espaces
          .trim();

        if (cleaned !== "") {
          const parsed = Number(cleaned.replace(/\s+/g, ""));
          if (!Number.isNaN(parsed)) {
            numeric = parsed;
          }
        }
      }
      // 🟡 Sinon, on accepte seulement les nombres purs
      else if (!Number.isNaN(Number(valueStr))) {
        numeric = Number(valueStr);
      }

      if (numeric !== null) {
        sum += numeric;
        hasNumeric = true;
      }
    }

    // 🔚 Décision finale (inchangée dans l’esprit)
    if (!hasNumeric) {
      totalRow[col] = "";
    } else if (hasCurrency) {
      totalRow[col] = `${formatNumber(sum)} ${currency}`;
    } else {
      totalRow[col] = formatNumber(sum);
    }
  });

  return totalRow;
}


export const getPaymentModeLabel = (value: string) => {
  if (value.toLowerCase() === "withdrawal") return "Retrait";
  return acceptPayment.find((accept) => accept.value === value)?.label || "-";
}


export function formatDecimal(value: Decimal | number | string): string {
  try {
    const decimal = new Decimal(value);
    return decimal.isInteger()
      ? decimal.toFixed(0)
      : decimal.toString();
  } catch {
    return "0";
  }
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
  for (const item of items) {
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

export async function fetchPdfAsArrayBuffer(path: string): Promise<ArrayBuffer> {
  try {
    if (!path || typeof path !== "string" || path.trim() === "") {
      throw new Error("URL ou chemin PDF invalide ou vide.");
    }

    const cleanedPath = path.trim();

    if (cleanedPath.includes("..") || cleanedPath.includes("//")) {
      throw new Error("Chemin PDF non autorisé.");
    }

    const url = cleanedPath.startsWith("http")
      ? cleanedPath
      : `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/upload?path=${encodeURIComponent(cleanedPath)}`;

    console.log("🔍 Tentative de chargement du PDF depuis:", url);
    console.log("📄 Chemin original:", path);

    const res = await fetch(url);

    if (!res.ok) {
      console.error("❌ Erreur HTTP:", res.status, res.statusText);
      console.error("❌ URL qui a échoué:", url);
      throw new Error(`Erreur HTTP ${res.status} lors du chargement du PDF: ${url}`);
    }

    console.log("✅ PDF chargé avec succès");

    const blob = await res.blob();
    const blobBuffer = await blob.arrayBuffer();
    const arrayBuffer = new ArrayBuffer(blobBuffer.byteLength);
    new Uint8Array(arrayBuffer).set(new Uint8Array(blobBuffer));

    return arrayBuffer;
  } catch (e) {
    console.error("Erreur fetchPdfAsArrayBuffer:", e);
    throw e;
  }
}
export async function urlToFile(path: string): Promise<File> {
  try {
    if (!path || typeof path !== "string" || path.trim() === "") {
      throw new Error("Chemin de fichier invalide ou vide.");
    }

    const cleanedPath = path.trim();

    if (cleanedPath.includes("..") || cleanedPath.includes("//")) {
      throw new Error("Chemin de fichier non autorisé.");
    }

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
      try {
        new URL(file, window.location.origin);
        return file;
      } catch {
        return null;
      }
    }

    if (file instanceof File) {
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

  const simpleFields = [
    "companyName",
    "country",
    "registeredAddress",
    "phoneNumber",
    "city",
    "codePostal",
    "niu",
    "legalForms",
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

export function isNegative(value: string | number | Decimal) {
  return new Decimal(value).isNeg()
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
      return false;
    }
  }

  return true;
}


export function hasAccess(
  resource: $Enums.Resource,
  action: $Enums.Action | $Enums.Action[],
  permissions: Permission[],
  role: "USER" | "ADMIN" = "USER"
): boolean {
  if (role === "ADMIN") return true;

  if (!resource || !action || !permissions) return false;

  const normalizedResource = resource.toUpperCase();

  const permission = permissions.find(
    (p) => p.resource.toUpperCase() === normalizedResource
  );

  if (!permission) return false;

  const actions = permission.actions;

  const actionList = Array.isArray(action) ? action : [action];

  return actionList.some((act) => {
    if (act === "READ") {
      return (
        actions.includes("READ") ||
        actions.includes("CREATE") ||
        actions.includes("MODIFY")
      );
    }

    return actions.includes(act);
  });
}



export function hasAccessToDashboard(user: any) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;

  return website.sidebarMenu.some((menu) => canAccessResource(user, 'DASHBOARD'));
}

export function canAccessResource(
  user: any,
  resource: string
): boolean {
  if (!user) return false;

  // Admin = accès total
  if (user.role === "ADMIN") return true;

  // Dashboard doit toujours être accessible
  if (resource === "DASHBOARD") return true;


  // Recherche de permission pour ce module
  const permission = user.permissions?.find((p: any) => p.resource === resource);

  // Si aucune permission → accès refusé
  if (!permission) return false;

  // L'utilisateur a au moins une action autorisée
  return permission.actions.length > 0;
}

export function assertUserCanAccessPage(user: any, pathname: string) {
  // Si pas d'utilisateur → laisser layout gérer redirect("/")
  if (!user) return;

  // Admin → accès total
  if (user.role === "ADMIN") return;

  // Trouver la ressource correspondant au path
  const route = website.sidebarMenu.find((item) => item.path === pathname);

  // Si aucune route trouvée → laisser Next gérer la 404 native
  if (!route) return;

  // Vérifier l'accès
  const allowed = canAccessResource(user, route.resource);

  if (!allowed) {
    notFound();
  }
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
      resource: Resource.CONTRACT,
      actions: [
        user.contract?.read ? Action.READ : null,
        user.contract?.edit ? Action.MODIFY : null,
        user.contract?.create ? Action.CREATE : null,
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
      return `${transaction.company.documentModel.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(transaction?.referenceInvoice?.invoiceNumber || 0, false)}`;
    }
  } else {
    if (transaction.referencePurchaseOrderId) {
      return `${transaction.company.documentModel.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(transaction?.referencePurchaseOrder?.purchaseOrderNumber || 0, false)}`;
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

export function toShortNum(value: number | string): string {
  const num = typeof value === "string"
    ? Number(value.replace(/\s+/g, "").replace(/,/g, "."))
    : Number(value);

  if (Number.isNaN(num)) return String(value);

  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  const format = (n: number, suffix: string) =>
    `${sign}${parseFloat(n.toFixed(1)).toString().replace(/\.0$/, "")}${suffix}`;

  if (abs >= 1_000_000_000_000) return format(abs / 1_000_000_000_000, "T");
  if (abs >= 1_000_000_000) return format(abs / 1_000_000_000, "B");
  if (abs >= 1_000_000) return format(abs / 1_000_000, "M");
  if (abs >= 1_000) return format(abs / 1_000, "K");
  return `${sign}${abs.toString()}`;
}




function extractNumber(value: any): number {
  if (!value) return 0;
  if (typeof value === "number") return value;

  return Number(
    String(value)
      .replace(/[^\d.,-]/g, "")
      .replace(/\s/g, "")
      .replace(",", ".")
  ) || 0;
}

export function addTotalRowWithCurrency(
  tableData: Record<string, any>[],
  columns: string[],
  currency: string,
  totalColumns: string[]
) {
  const totalRow: Record<string, any> = {};

  columns.forEach(col => {
    if (totalColumns.includes(col)) {
      const sum = tableData.reduce(
        (acc, row) => acc + extractNumber(row[col]),
        0
      );
      totalRow[col] = `${formatNumber(sum)} ${currency}`;
    } else {
      totalRow[col] = col === columns[0] ? "TOTAL" : "";
    }
  });

  return totalRow;
}
