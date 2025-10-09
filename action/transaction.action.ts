import { DibursementSchemaType } from "@/lib/zod/dibursement.schema";
import { ReceiptSchemaType } from "@/lib/zod/receipt.schema";
import {
  AllocationSchemaType,
  CategorySchemaType,
  NatureSchemaType,
  SourceSchemaType,
} from "@/lib/zod/transaction.schema";
import { RequestResponse } from "@/types/api.types";
import {
  AllocationType,
  DeletedTransactions,
  GetTransactionsParams,
  SourceType,
  TransactionCategoryType,
  TransactionDocument,
  TransactionNatureType,
  TransactionType,
} from "@/types/transaction.type";

export async function getTransactions(params: GetTransactionsParams) {
  try {
    const query = new URLSearchParams();

    // Pagination
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.take) query.set("take", String(params.take));

    // Filtres directs
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.movementValue) query.set("movementValue", params.movementValue);
    if (params.categoryValue) query.set("categoryValue", params.categoryValue);
    if (params.paymentModeValue)
      query.set("paymentModeValue", params.paymentModeValue);
    if (params.sourceValue) query.set("sourceValue", params.sourceValue);
    if (params.paidForValue) query.set("paidForValue", params.paidForValue);

    // Filtres de tri (un seul à la fois)
    const sortKeys = [
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
    ] as const;

    // Ajouter le paramètre de tri actif
    for (const key of sortKeys) {
      if (params[key]) {
        query.set(key, params[key]!);
        break; // Un seul tri à la fois
      }
    }

    const url = `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/${params.companyId}?${query.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Éviter le cache pour les données dynamiques
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res: RequestResponse<TransactionType[]> = await response.json();

    if (res.state === "error") {
      throw new Error(res.message);
    }

    return res;
  } catch (error) {
    console.error("Error in getTransactions:", error);
    throw error;
  }
}

export async function getCategories({ companyId }: { companyId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/category/${companyId}`,
      {
        method: "GET",
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

export async function getSources({ companyId }: { companyId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/source/${companyId}`,
      {
        method: "GET",
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

export async function getNatures({ categoryId }: { categoryId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/nature/${categoryId}`,
      {
        method: "GET",
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

export async function getDocuments({ companyId }: { companyId: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction/${companyId}/document`,
      {
        method: "GET",
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
}: {
  data: DeletedTransactions[];
}) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_URL!}/api/transaction`,
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
