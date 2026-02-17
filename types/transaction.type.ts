import { $Enums } from "@/lib/generated/prisma";
import { InvoiceType } from "./invoice.types";
import { ClientType } from "./client.types";
import { CompanyType } from "./company.types";
import { PurchaseOrderType } from "./purchase-order.types";
import Decimal from "decimal.js";
import { ProjectType } from "./project.types";

export type TransactionType = {
  id: string;
  type: $Enums.TransactionType;
  reference: number;
  date: Date;
  movement: $Enums.BankTransaction;

  categoryId: string;
  category: TransactionCategoryType;

  natureId: string;
  nature: TransactionNatureType;

  documentReference: string;

  amount: string;
  amountType: $Enums.AmountType;

  paymentType: string;
  checkNumber: string;

  referenceInvoiceId?: string;
  referenceInvoice?: InvoiceType;

  projectId?: string;
  project?: ProjectType
  fiscalObjectId?: string;

  referencePurchaseOrderId?: string;
  referencePurchaseOrder?: PurchaseOrderType;

  userActionId?: string;
  userAction?: UserActionType;

  sourceId?: string;
  source?: SourceType;

  hasDelete: boolean;

  period: string | null;

  payOnBehalfOfId?: string;
  payOnBehalfOf?: ClientType;

  clientOrSupplier: string;
  clientOrSupplierType: UserActionType;

  infos?: string;

  companyId: string;
  company: CompanyType;

  updatedAt: Date;
  createdAt: Date;
};

export type TransactionCategoryType = {
  id: string;
  name: string;
  natures: TransactionNatureType[];
};

export type TransactionNatureType = {
  id: string;
  name: string;
};

export type SourceType = {
  id: string;
  sourceType: $Enums.SourceType;
  name: string;
};

export type UserActionType = {
  id: string;
  name: string;

  natureId: string;
  nature: TransactionNatureType;

  companyId: string;
  company: CompanyType;
};

export type FiscalObjectType = {
  id: string;
  name: string;
};

export type TransactionDocument = {
  id: string;
  amountType: $Enums.AmountType
  type: string;
  reference: string;
  price: string;
  payee: string;
  currency: string;
};

export type GetTransactionsParams = {
  companyId: string;

  // Pagination
  skip?: number;
  take?: number;

  // Filtres
  startDate?: string | null;
  endDate?: string | null;
  movementValue?: string[] | null;
  categoryValue?: string[] | null;
  natureValue?: string[] | null;
  paymentModeValue?: string[] | null;
  sourceValue?: string[] | null;
  paidForValue?: string | null;

  // Tri (un seul actif à la fois)
  byDate?: "asc" | "desc";
  byAmount?: "asc" | "desc";
  byMovement?: "asc" | "desc";
  byCategory?: "asc" | "desc";
  byNature?: "asc" | "desc";
  byPaymentMode?: "asc" | "desc";
  bySource?: "asc" | "desc";
};

export type DeletedTransactions = {
  id: string;
  transactionType: $Enums.TransactionType;
};


export type SourceTransaction = {
  sourceName: string,
  sourceId: string,
  sourceType: string,
  totalReceipts: Decimal,
  totalDisbursements: Decimal,
  difference: Decimal,
  percentageDifference: number
}

export type CategoryDetailType = {
  categoryId: string,
  categoryName: string,
  total: Decimal,
  percentage: number,
}

export type CategoryItemType = {
  categoryId: string;
  categoryName: string;
  total: string;
}

export type NatureItemType = {
  natureId: string;
  name: string;
  total: string;
  percent: string;
}

export type CategoryFilterType = {
  total: Decimal;
  categories: CategoryItemType[]
  natures: NatureItemType[]
}

export type DividendType = {
  natureId: string;
  name: string;
  total: string;
}

export type TransactionTotal = {
  totalReceipt: string;
  totalDibursement: string;
}