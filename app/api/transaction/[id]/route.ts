import { INVOICE_PREFIX, PURCHASE_ORDER_PREFIX } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { generateAmaId, getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  checkAccess(["TRANSACTION"], "READ");
  try {
    const companyId = getIdFromUrl(req.url, 2);
    if (!companyId) {
      return NextResponse.json(
        { state: "error", message: "Identifiant invalide." },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const take = parseInt(searchParams.get("take") || "20", 10);

    // Filtres
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const movementValue = searchParams.get("movementValue");
    const natureValue = searchParams.get("natureValue");
    const categoryValue = searchParams.get("categoryValue");
    const sourceValue = searchParams.get("sourceValue");
    const paidForValue = searchParams.get("paidForValue");

    // Tri
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

    const activeSort = sortKeys.find((key) => searchParams.has(key));
    const sortOrder = activeSort
      ? (searchParams.get(activeSort) as "asc" | "desc")
      : "desc";

    // Construction des conditions WHERE communes
    const baseWhere: any = { companyId };

    const parseIso = (s?: string | null) => {
      if (!s) return null;
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };
    const parsedStart = parseIso(startDate);
    const parsedEnd = parseIso(endDate);

    if (parsedStart || parsedEnd) {
      baseWhere.date = {};
      if (parsedStart) baseWhere.date.gte = parsedStart;
      if (parsedEnd) baseWhere.date.lte = parsedEnd;
    }
    if (movementValue) baseWhere.movement = movementValue;
    if (categoryValue) baseWhere.categoryId = categoryValue;
    if (natureValue) baseWhere.natureId = natureValue;
    if (sourceValue) baseWhere.sourceId = sourceValue;

    // WHERE spécifique pour disbursements (seuls ils ont payOnBehalfOf)
    const disbursementWhere = { ...baseWhere };
    if (paidForValue) disbursementWhere.payOnBehalfOfId = paidForValue;

    // Construction de l'orderBy pour Prisma
    let orderBy: any = [{ createdAt: "asc" }];

    if (activeSort && sortOrder) {
      switch (activeSort) {
        case "byDate":
          orderBy = [{ createdAt: sortOrder }, { createdAt: "asc" }];
          break;
        case "byAmount":
          orderBy = [{ amount: sortOrder }, { createdAt: "asc" }];
          break;
        case "byMovement":
          orderBy = [{ movement: sortOrder }, { createdAt: "asc" }];
          break;
        case "byCategory":
          orderBy = [{ category: { name: sortOrder } }, { createdAt: "asc" }];
          break;
        case "byNature":
          orderBy = [{ nature: { name: sortOrder } }, { createdAt: "asc" }];
          break;
        case "byDescription":
          orderBy = [{ description: sortOrder }, { createdAt: "asc" }];
          break;
        case "byAllocation":
          orderBy = [
            { allocation: { name: sortOrder } },
            { createdAt: "asc" },
          ];
          break;
        case "bySource":
          orderBy = [{ source: { name: sortOrder } }, { createdAt: "asc" }];
          break;
        case "byPaidOnBehalfOf":
          orderBy = [
            { payOnBehalfOf: { lastname: sortOrder } },
            { createdAt: "asc" },
          ];
          break;
        default:
          orderBy = [{ createdAt: "asc" }];
      }
    }

    // Sélection des champs communs
    const commonSelect = {
      id: true,
      type: true,
      reference: true,
      date: true,
      movement: true,
      amount: true,
      amountType: true,
      description: true,
      paymentType: true,
      checkNumber: true,
      comment: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      nature: {
        select: {
          id: true,
          name: true,
        },
      },
      source: {
        select: {
          id: true,
          name: true,
        },
      },
      company: {
        select: {
          documentModel: true,
        },
      },
    };

    // Récupération des recettes (receipts)
    const receipts = await prisma.receipt.findMany({
      where: baseWhere,
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy,
      select: {
        ...commonSelect,
        supplier: true,
        client: true,
        referenceInvoiceId: true,
        referenceInvoice: {
          select: {
            id: true,
            invoiceNumber: true,
          },
        },
      },
    });

    // Récupération des décaissements (disbursements) - Note: orthographe "Dibursement" dans votre schéma
    const disbursements = await prisma.dibursement.findMany({
      where: disbursementWhere,
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy,
      select: {
        ...commonSelect,
        supplier: true,
        client: true,
        allocation: {
          select: {
            id: true,
            name: true,
          },
        },
        payOnBehalfOf: {
          select: {
            id: true,
            profile: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
          },
        },
        referencePurchaseOrderId: true,
        referencePurchaseOrder: {
          select: {
            id: true,
            purchaseOrderNumber: true,
          },
        },
      },
    });

    // Normalisation des données pour avoir une structure uniforme
    const normalizedReceipts = receipts.map((receipt) => ({
      ...receipt,
      allocation: null,
      payOnBehalfOf: null,
      documentReference: receipt.referenceInvoice?.invoiceNumber ? `${receipt.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(receipt.referenceInvoice?.invoiceNumber as number, false)}` : "-",
      type: receipt.type.toString(),
      movement: receipt.movement.toString(),
      amountType: receipt.amountType.toString(),
    }));

    const normalizedDisbursements = disbursements.map((disbursement) => ({
      ...disbursement,
      // Conversion du type enum en string pour cohérence
      type: disbursement.type.toString(),
      movement: disbursement.movement.toString(),
      amountType: disbursement.amountType.toString(),
      documentReference: disbursement.referencePurchaseOrder?.purchaseOrderNumber ? `${disbursement.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(disbursement.referencePurchaseOrder?.purchaseOrderNumber as number, false)}` : "-",
      // Normalisation du payOnBehalfOf avec profile
      payOnBehalfOf: disbursement.payOnBehalfOf
        ? {
          id: disbursement.payOnBehalfOf.id,
          firstname: disbursement.payOnBehalfOf.profile?.firstname || "",
          lastname: disbursement.payOnBehalfOf.profile?.lastname || "",
        }
        : null,
    }));

    // Fusion des deux arrays
    let transactions = [...normalizedReceipts, ...normalizedDisbursements];

    // Tri côté application pour gérer la fusion des deux tables
    transactions.sort((a, b) => {
      if (activeSort === "byAmount") {
        const aAmount = parseFloat(a.amount?.toString() || "0");
        const bAmount = parseFloat(b.amount?.toString() || "0");
        return sortOrder === "asc" ? aAmount - bAmount : bAmount - aAmount;
      }

      if (activeSort === "byDate") {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (activeSort === "byDescription") {
        const aDesc = a.description || "";
        const bDesc = b.description || "";
        return sortOrder === "asc"
          ? aDesc.localeCompare(bDesc)
          : bDesc.localeCompare(aDesc);
      }

      if (activeSort === "byCategory") {
        const aCategory = a.category?.name || "";
        const bCategory = b.category?.name || "";
        return sortOrder === "asc"
          ? aCategory.localeCompare(bCategory)
          : bCategory.localeCompare(aCategory);
      }

      if (activeSort === "byNature") {
        const aNature = a.nature?.name || "";
        const bNature = b.nature?.name || "";
        return sortOrder === "asc"
          ? aNature.localeCompare(bNature)
          : bNature.localeCompare(aNature);
      }

      if (activeSort === "byMovement") {
        return sortOrder === "asc"
          ? a.movement.localeCompare(b.movement)
          : b.movement.localeCompare(a.movement);
      }

      if (activeSort === "byAllocation") {
        const aAllocation = a.allocation?.name || "";
        const bAllocation = b.allocation?.name || "";
        return sortOrder === "asc"
          ? aAllocation.localeCompare(bAllocation)
          : bAllocation.localeCompare(aAllocation);
      }

      if (activeSort === "bySource") {
        const aSource = a.source?.name || "";
        const bSource = b.source?.name || "";
        return sortOrder === "asc"
          ? aSource.localeCompare(bSource)
          : bSource.localeCompare(aSource);
      }

      if (activeSort === "byPaidOnBehalfOf") {
        const aPaid = a.payOnBehalfOf
          ? `${a.payOnBehalfOf.lastname} ${a.payOnBehalfOf.firstname}`
          : "";
        const bPaid = b.payOnBehalfOf
          ? `${b.payOnBehalfOf.lastname} ${b.payOnBehalfOf.firstname}`
          : "";
        return sortOrder === "asc"
          ? aPaid.localeCompare(bPaid)
          : bPaid.localeCompare(aPaid);
      }

      // Tri par défaut par date de création (plus récent en premier)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Pagination
    const transactionList = transactions.slice(0, take);
    const nextCursor =
      transactions.length > take ? transactions[take].id : null;

    // Transformation finale des données pour le frontend
    const formattedTransactions = transactionList.map((transaction) => ({
      ...transaction,
      // Assurer la cohérence des champs nullable
      checkNumber: transaction.checkNumber || null,
      comment: transaction.comment || null,
      description: transaction.description || null,
      // Formater payOnBehalfOf avec le champ name pour le frontend
      payOnBehalfOf: transaction.payOnBehalfOf
        ? {
          ...transaction.payOnBehalfOf,
          name: `${transaction.payOnBehalfOf.lastname} ${transaction.payOnBehalfOf.firstname}`.trim(),
        }
        : null,
    }));

    return NextResponse.json(
      {
        state: "success",
        data: formattedTransactions,
        nextCursor,
        total: transactions.length,
        hasMore: !!nextCursor,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des transactions.",
      },
      { status: 500 },
    );
  }
}
