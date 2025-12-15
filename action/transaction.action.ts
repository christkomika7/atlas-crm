import { compressString } from "@/lib/utils";
import { DibursementSchemaType } from "@/lib/zod/dibursement.schema";
import { ReceiptSchemaType } from "@/lib/zod/receipt.schema";
import {
  AllocationSchemaType,
  CategorySchemaType,
  FiscalObjectSchemaType,
  NatureSchemaType,
  SourceSchemaType,
} from "@/lib/zod/transaction.schema";
import { TransferSchemaType } from "@/lib/zod/transfert.schema";
import { RequestResponse } from "@/types/api.types";
import {
  AllocationType,
  DeletedTransactions,
  FiscalObjectType,
  GetTransactionsParams,
  SourceType,
  TransactionCategoryType,
  TransactionDocument,
  TransactionNatureType,
  TransactionType,
} from "@/types/transaction.type";

export async function exportToDocument({
  datas,
  companyId,
  doc
}: {
  datas: TransactionType[];
  companyId: string;
  doc: 'excel' | 'word'
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ datas, companyId, doc }),
    });

    if (!response.ok) {
      const errRes = await response.json().catch(() => null);
      throw new Error(errRes?.message || `Erreur lors de l'export ${doc.toUpperCase()}`);
    }

    const blob = await response.blob();

    let filename = doc === 'excel' ? "transactions.xlsx" : "transactions.docx";

    if (doc === 'word') {
      const contentDisposition = response.headers.get("Content-Disposition");
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return {
      status: "success",
      message: `Fichier ${doc === 'excel' ? 'Excel' : 'DOCX'} téléchargé avec succès`
    };

  } catch (error) {
    console.error("Erreur dans exportToDocument:", error);
    throw error;
  }
}


export async function getTransactions(params: GetTransactionsParams) {
  try {
    const query = new URLSearchParams();

    if (params.skip !== undefined) query.set("skip", String(params.skip));
    if (params.take !== undefined) query.set("take", String(params.take));

    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);

    if (params.movementValue && params.movementValue.length > 0)
      query.set("movementValue", params.movementValue.join(","));
    if (params.categoryValue && params.categoryValue.length > 0)
      query.set("categoryValue", params.categoryValue.join(","));
    if (params.natureValue && params.natureValue.length > 0)
      query.set("natureValue", params.natureValue.join(","));
    if (params.paymentModeValue && params.paymentModeValue.length > 0)
      query.set("paymentModeValue", params.paymentModeValue.join(","));
    if (params.sourceValue && params.sourceValue.length > 0)
      query.set("sourceValue", params.sourceValue.join(","));

    if (params.paidForValue) query.set("paidForValue", params.paidForValue);

    const sortKeys: (keyof GetTransactionsParams)[] = [
      "byDate",
      "byAmount",
      "byMovement",
      "byCategory",
      "byNature",
      "byDescription",
      "byPaymentMode",
      "byAllocation",
      "bySource",
      "byPaidOnBehalfOf",
    ];

    for (const key of sortKeys) {
      if (params[key]) {
        query.set(key, String(params[key]!));
        break;
      }
    }

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/${params.companyId}?${query.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const res: RequestResponse<TransactionType[]> = await response.json();
    if (res.state === "error") throw new Error(res.message);

    return { data: res.data || [], all: res.all || [], total: res.total || (res.data ? res.data.length : 0) };
  } catch (error) {
    console.error("Error in getTransactions:", error);
    throw error;
  }
}

export async function getCategories({ companyId, type, filter = false }: { companyId: string, type?: "receipt" | "dibursement", filter?: boolean }) {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (filter) params.append("filter", JSON.stringify(filter));

  const queryString = params.toString();
  const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/category/${companyId}${queryString ? `?${queryString}` : ""
    }`;

  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      },
    );

    const res: RequestResponse<TransactionCategoryType[]> =
      await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getFisclaObjects({ companyId }: { companyId: string }) {

  const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/fiscal-object/${companyId}`;

  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      },
    );

    const res: RequestResponse<FiscalObjectType[]> =
      await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getSourcesByCompany({ companyId, filter }: { companyId: string, filter?: boolean }) {
  const params = new URLSearchParams();
  if (filter) params.append("filter", JSON.stringify(filter));

  const queryString = params.toString();
  const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/source/${companyId}/company${queryString ? `?${queryString}` : ""
    }`;

  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      },
    );

    const res: RequestResponse<SourceType[]> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getSources({ companyId, type, filter }: { companyId: string, type?: "cash" | "check" | "bank-transfer" | "all", filter?: boolean }) {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (filter) params.append("filter", JSON.stringify(filter));

  const queryString = params.toString();
  const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/source/${companyId}${queryString ? `?${queryString}` : ""
    }`;

  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      },
    );

    const res: RequestResponse<SourceType[]> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getAllocations({ companyId }: { companyId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/allocation/${companyId}`,
      {
        method: "GET",
        cache: "no-store"
      },
    );

    const res: RequestResponse<AllocationType[]> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getNaturesByCompanyId({ companyId, filter, categories }: { companyId: string, filter?: boolean, categories?: string[] }) {
  const params = new URLSearchParams();

  if (filter) params.append("filter", JSON.stringify(filter));
  if (categories && categories.length > 0) {
    const compressed = await compressString(JSON.stringify(categories));
    params.append('categories', compressed)
  }

  const queryString = params.toString();
  const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/nature/${companyId}/company${queryString ? `?${queryString}` : ""
    }`;

  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      },
    );

    const res: RequestResponse<TransactionNatureType[]> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}


export async function getNatures({ categoryId }: { categoryId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/nature/${categoryId}`,
      {
        method: "GET",
        cache: "no-store"
      },
    );

    const res: RequestResponse<TransactionNatureType[]> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getDocuments({ companyId, type }: { companyId: string, type: "receipt" | "dibursement" }) {
  const params = new URLSearchParams();
  params.append("type", type);

  const queryString = params.toString();
  const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/${companyId}/document${queryString ? `?${queryString}` : ""
    }`;

  try {
    const response = await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      },
    );

    const res: RequestResponse<TransactionDocument[]> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function createCategory(data: CategorySchemaType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/category`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res: RequestResponse<TransactionCategoryType> = await response.json();

    if (!response.ok) {
      throw new Error(
        res.message ||
        "Erreur lors de la création de la catégorie de la transaction",
      );
    }

    return res;
  } catch (error) {
    console.error("Erreur dans la fonction create:", error);
    throw error;
  }
}

export async function createFiscalObject(data: FiscalObjectSchemaType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/fiscal-object`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res: RequestResponse<FiscalObjectType> = await response.json();

    if (!response.ok) {
      throw new Error(
        res.message ||
        "Erreur lors de la création de l'objet de paiement",
      );
    }

    return res;
  } catch (error) {
    console.error("Erreur dans la fonction create:", error);
    throw error;
  }
}

export async function createNature(data: NatureSchemaType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/nature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res: RequestResponse<TransactionNatureType> = await response.json();

    if (!response.ok) {
      throw new Error(
        res.message ||
        "Erreur lors de la création de la nature de la transaction",
      );
    }

    return res;
  } catch (error) {
    console.error("Erreur dans la fonction create:", error);
    throw error;
  }
}

export async function createSource(data: SourceSchemaType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/source`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res: RequestResponse<SourceType> = await response.json();

    if (!response.ok) {
      throw new Error(
        res.message ||
        "Erreur lors de la création de la source de la transaction",
      );
    }

    return res;
  } catch (error) {
    console.error("Erreur dans la fonction create:", error);
    throw error;
  }
}

export async function createAllocation(data: AllocationSchemaType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/allocation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res: RequestResponse<AllocationType> = await response.json();

    if (!response.ok) {
      throw new Error(
        res.message || "Erreur lors de la création de l'allocation",
      );
    }

    return res;
  } catch (error) {
    console.error("Erreur dans la fonction create:", error);
    throw error;
  }
}

export async function createReceipt(data: ReceiptSchemaType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/receipt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res: RequestResponse<TransactionType> = await response.json();

    if (!response.ok) {
      throw new Error(
        res.message || "Erreur lors de la création de l'encaissement",
      );
    }

    return res;
  } catch (error) {
    console.error("Erreur dans la fonction create:", error);
    throw error;
  }
}

export async function createDibursement(data: DibursementSchemaType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/dibursement`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res: RequestResponse<TransactionType> = await response.json();

    if (!response.ok) {
      throw new Error(
        res.message || "Erreur lors de la création de décaissement",
      );
    }

    return res;
  } catch (error) {
    console.error("Erreur dans la fonction create:", error);
    throw error;
  }
}

export async function createTransfer(data: TransferSchemaType) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/transfer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    const res: RequestResponse<TransactionType> = await response.json();

    if (!response.ok) {
      throw new Error(
        res.message || "Erreur lors de la réalisation du transfer",
      );
    }

    return res;
  } catch (error) {
    console.error("Erreur dans la fonction create:", error);
    throw error;
  }
}

export async function deleteCategory({ categoryId }: { categoryId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/category/${categoryId}`,
      {
        method: "DELETE",
      },
    );

    const res: RequestResponse<TransactionCategoryType> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function deleteFiscalObject({ fiscalObjectId }: { fiscalObjectId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/fiscal-object/${fiscalObjectId}`,
      {
        method: "DELETE",
      },
    );

    const res: RequestResponse<FiscalObjectType> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function deleteNature({ natureId }: { natureId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/nature/${natureId}`,
      {
        method: "DELETE",
      },
    );

    const res: RequestResponse<TransactionNatureType> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function deleteSource({ sourceId }: { sourceId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/source/${sourceId}`,
      {
        method: "DELETE",
      },
    );

    const res: RequestResponse<SourceType> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function deleteAllocation({
  allocationId,
}: {
  allocationId: string;
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/allocation/${allocationId}`,
      {
        method: "DELETE",
      },
    );

    const res: RequestResponse<AllocationType> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function deleteTransactions({
  data,
  companyId
}: {
  data: DeletedTransactions[];
  companyId: string
}) {
  const params = new URLSearchParams();
  if (companyId) params.append("companyId", companyId);

  const queryString = params.toString();
  const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction${queryString ? `?${queryString}` : ""
    }`;

  try {
    const response = await fetch(
      url,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      },
    );

    const res: RequestResponse<TransactionType[]> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}

export async function removeTransaction({ id }: { id: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/${id}`,
      {
        method: "DELETE",
      },
    );

    const res: RequestResponse<TransactionType> = await response.json();
    if (!response.ok) {
      throw new Error(res.message);
    }
    return res;
  } catch (error) {
    throw error;
  }
}
