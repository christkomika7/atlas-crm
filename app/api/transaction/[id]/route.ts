import { $Enums } from '@/lib/generated/prisma';
import { INVOICE_PREFIX, PURCHASE_ORDER_PREFIX, DEFAULT_PAGE_SIZE } from "@/config/constant";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { generateAmaId, getIdFromUrl } from "@/lib/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const result = await checkAccess("TRANSACTION", ["READ"]);

  if (!result.authorized) {
    return NextResponse.json(
      {
        status: "error",
        message: result.message,
        data: []
      },
      { status: 200 }
    );
  }

  try {
    const companyId = getIdFromUrl(req.url, 2);
    if (!companyId) {
      return NextResponse.json(
        { state: "error", message: "Identifiant invalide." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);

    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const take = parseInt(searchParams.get("take") || DEFAULT_PAGE_SIZE.toString(), 10);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const movementValues = searchParams.get("movementValue")?.split(",") || [];
    const categoryValues = searchParams.get("categoryValue")?.split(",") || [];
    const sourceValues = searchParams.get("sourceValue")?.split(",") || [];
    const natureValues = searchParams.get("natureValue")?.split(",") || [];
    const paymentModeValues = searchParams.get("paymentModeValue")?.split(",") || [];

    const sortKeys = [
      "byDate",
      "byAmount",
      "byMovement",
      "byCategory",
      "byNature",
      "byPaymentMode",
      "bySource",
    ] as const;

    const activeSort = sortKeys.find((key) => searchParams.has(key));
    const sortOrder = activeSort ? (searchParams.get(activeSort) as "asc" | "desc") : "desc";

    const parseIso = (s?: string | null) => {
      if (!s) return null;
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };
    const parsedStart = parseIso(startDate);
    const parsedEnd = parseIso(endDate);

    const baseWhere: any = { companyId };
    if (parsedStart || parsedEnd) {
      baseWhere.date = {};
      if (parsedStart) baseWhere.date.gte = parsedStart;
      if (parsedEnd) baseWhere.date.lte = parsedEnd;
    }

    if (movementValues.length) baseWhere.movement = { in: movementValues };
    if (categoryValues.length) baseWhere.categoryId = { in: categoryValues };
    if (sourceValues.length) baseWhere.sourceId = { in: sourceValues };
    if (natureValues.length) baseWhere.natureId = { in: natureValues };
    if (paymentModeValues.length) baseWhere.paymentType = { in: paymentModeValues };

    const disbursementWhere = { ...baseWhere };

    const commonSelect = {
      id: true,
      type: true,
      reference: true,
      date: true,
      movement: true,
      amount: true,
      amountType: true,
      infos: true,
      paymentType: true,
      checkNumber: true,
      createdAt: true,
      category: { select: { id: true, name: true } },
      nature: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } },
      company: { select: { documentModel: true } },
    };

    const allReceipts = await prisma.receipt.findMany({
      where: baseWhere,
      orderBy: { date: "desc" },
      select: {
        ...commonSelect,
        client: true,
        referenceInvoiceId: true,
        referenceInvoice: { select: { id: true, invoiceNumber: true } },
        userAction: true
      },
    });

    const allDisbursements = await prisma.dibursement.findMany({
      where: disbursementWhere,
      orderBy: { date: "desc" },
      select: {
        ...commonSelect,
        period: true,
        suppliers: true,
        referencePurchaseOrderId: true,
        referencePurchaseOrder: { select: { id: true, purchaseOrderNumber: true } },
        userAction: true
      },
    });

    const normalizedReceipts = allReceipts.map((receipt) => ({
      ...receipt,
      payOnBehalfOf: null,
      documentReference: receipt.referenceInvoice?.invoiceNumber
        ? `${receipt.company.documentModel?.invoicesPrefix || INVOICE_PREFIX}-${generateAmaId(
          receipt.referenceInvoice?.invoiceNumber as number,
          false
        )}`
        : "-",
      period: "",
      type: receipt.type.toString(),
      movement: receipt.movement.toString(),
      amountType: receipt.amountType.toString(),
      clientOrSupplier: receipt.userAction?.name || "-",
    }));



    const normalizedDisbursements = allDisbursements.map((disbursement) => ({
      ...disbursement,
      type: disbursement.type.toString(),
      period: disbursement.period,
      clientOrSupplier: disbursement.userAction?.name || "-",
      movement: disbursement.movement.toString(),
      amountType: disbursement.amountType.toString(),
      documentReference: disbursement.referencePurchaseOrder?.purchaseOrderNumber
        ? `${disbursement.company.documentModel?.purchaseOrderPrefix || PURCHASE_ORDER_PREFIX}-${generateAmaId(
          disbursement.referencePurchaseOrder?.purchaseOrderNumber as number,
          false
        )}`
        : "-",
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
        const aDate = new Date(a.date).getTime();
        const bDate = new Date(b.date).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
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

      if (activeSort === "bySource") {
        const aSource = a.source?.name || "";
        const bSource = b.source?.name || "";
        return sortOrder === "asc" ? aSource.localeCompare(bSource) : bSource.localeCompare(aSource);
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const total = allTransactions.length;
    const paginatedTransactions = allTransactions.slice(skip, skip + take);

    const formattedTransactions = paginatedTransactions.map((transaction) => ({
      ...transaction,
      checkNumber: transaction.checkNumber || null,
      infos: transaction.infos || null,
    }));


    const formattedAllTransactions = allTransactions.map((transaction) => ({
      ...transaction,
      checkNumber: transaction.checkNumber || null,
      infos: transaction.infos || null,
    }));

    return NextResponse.json({ state: "success", data: formattedTransactions, all: formattedAllTransactions, total }, { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        state: "error",
        message: error instanceof Error ? error.message : "Erreur lors de la récupération des transactions.",
      },
      { status: 500 }
    );
  }
}
