import { INVOICE_PREFIX, PURCHASE_ORDER_PREFIX, DEFAULT_PAGE_SIZE } from "@/config/constant";
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

    // Pagination offset-based avec constante
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const take = parseInt(searchParams.get("take") || DEFAULT_PAGE_SIZE.toString(), 10);

    // Filtres
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const movementValue = searchParams.get("movementValue");
    const categoryValue = searchParams.get("categoryValue");
    const sourceValue = searchParams.get("sourceValue");
    const paidForValue = searchParams.get("paidForValue");
    const paymentModeValue = searchParams.get("paymentModeValue");

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

    // Construction WHERE
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
    if (sourceValue) baseWhere.sourceId = sourceValue;
    if (paymentModeValue) baseWhere.paymentType = paymentModeValue;

    const disbursementWhere = { ...baseWhere };
    if (paidForValue) disbursementWhere.payOnBehalfOfId = paidForValue;

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
      category: { select: { id: true, name: true } },
      nature: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } },
      company: { select: { documentModel: true } },
    };

    const allReceipts = await prisma.receipt.findMany({
      where: baseWhere,
      select: {
        ...commonSelect, supplier: true, client: true, referenceInvoiceId: true,
        referenceInvoice: { select: { id: true, invoiceNumber: true } },
      },
    });

    const allDisbursements = await prisma.dibursement.findMany({
      where: disbursementWhere,
      select: {
        ...commonSelect, supplier: true, client: true,
        allocation: { select: { id: true, name: true } },
        payOnBehalfOf: { select: { id: true, profile: { select: { firstname: true, lastname: true } } } },
        referencePurchaseOrderId: true,
        referencePurchaseOrder: { select: { id: true, purchaseOrderNumber: true } },
      },
    });

    const normalizedReceipts = allReceipts.map((receipt) => ({
      ...receipt,
      allocation: null,
      payOnBehalfOf: null,
      documentReference: receipt.referenceInvoice?.invoiceNumber
        ? `${receipt.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(receipt.referenceInvoice?.invoiceNumber as number, false)}`
        : "-",
      type: receipt.type.toString(),
      movement: receipt.movement.toString(),
      amountType: receipt.amountType.toString(),
    }));

    const normalizedDisbursements = allDisbursements.map((disbursement) => ({
      ...disbursement,
      type: disbursement.type.toString(),
      movement: disbursement.movement.toString(),
      amountType: disbursement.amountType.toString(),
      documentReference: disbursement.referencePurchaseOrder?.purchaseOrderNumber
        ? `${disbursement.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(disbursement.referencePurchaseOrder?.purchaseOrderNumber as number, false)}`
        : "-",
      payOnBehalfOf: disbursement.payOnBehalfOf
        ? {
          id: disbursement.payOnBehalfOf.id,
          firstname: disbursement.payOnBehalfOf.profile?.firstname || "",
          lastname: disbursement.payOnBehalfOf.profile?.lastname || "",
        }
        : null,
    }));

    let allTransactions = [...normalizedReceipts, ...normalizedDisbursements];

    // Tri côté application
    allTransactions.sort((a, b) => {
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
        return sortOrder === "asc" ? aDesc.localeCompare(bDesc) : bDesc.localeCompare(aDesc);
      }

      if (activeSort === "byCategory") {
        const aCategory = a.category?.name || "";
        const bCategory = b.category?.name || "";
        return sortOrder === "asc" ? aCategory.localeCompare(bCategory) : bCategory.localeCompare(aCategory);
      }

      if (activeSort === "byNature") {
        const aNature = a.nature?.name || "";
        const bNature = b.nature?.name || "";
        return sortOrder === "asc" ? aNature.localeCompare(bNature) : bNature.localeCompare(aNature);
      }

      if (activeSort === "byMovement") {
        return sortOrder === "asc" ? a.movement.localeCompare(b.movement) : b.movement.localeCompare(a.movement);
      }

      if (activeSort === "byAllocation") {
        const aAllocation = a.allocation?.name || "";
        const bAllocation = b.allocation?.name || "";
        return sortOrder === "asc" ? aAllocation.localeCompare(bAllocation) : bAllocation.localeCompare(aAllocation);
      }

      if (activeSort === "bySource") {
        const aSource = a.source?.name || "";
        const bSource = b.source?.name || "";
        return sortOrder === "asc" ? aSource.localeCompare(bSource) : bSource.localeCompare(aSource);
      }

      if (activeSort === "byPaidOnBehalfOf") {
        const aPaid = a.payOnBehalfOf ? `${a.payOnBehalfOf.lastname} ${a.payOnBehalfOf.firstname}` : "";
        const bPaid = b.payOnBehalfOf ? `${b.payOnBehalfOf.lastname} ${b.payOnBehalfOf.firstname}` : "";
        return sortOrder === "asc" ? aPaid.localeCompare(bPaid) : bPaid.localeCompare(aPaid);
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = allTransactions.length;
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    const formattedTransactions = paginatedTransactions.map((transaction) => ({
      ...transaction,
      checkNumber: transaction.checkNumber || null,
      comment: transaction.comment || null,
      description: transaction.description || null,
      payOnBehalfOf: transaction.payOnBehalfOf
        ? {
          ...transaction.payOnBehalfOf,
          name: `${transaction.payOnBehalfOf.lastname} ${transaction.payOnBehalfOf.firstname}`.trim(),
        }
        : null,
    }));

    return NextResponse.json(
      { state: "success", data: formattedTransactions, total },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        state: "error",
        message: error instanceof Error ? error.message : "Erreur lors de la récupération des transactions.",
      },
      { status: 500 },
    );
  }
}
