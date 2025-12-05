import {
  ADMINISTRATION_CATEGORY,
  FISCAL_NATURE,
  FISCAL_OBJECT,
} from "@/config/constant";
import { checkAccess } from "@/lib/access";
import prisma from "@/lib/prisma";
import { TaxInput } from "@/types/tax.type";
import Decimal from "decimal.js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = await checkAccess("DASHBOARD", ["READ"]);
  if (!res.authorized) {
    return Response.json(
      {
        status: "error",
        message: res.message,
        data: [],
      },
      { status: 200 },
    );
  }

  const companyId = req.nextUrl.searchParams.get("companyId") as string;
  if (!companyId) {
    return NextResponse.json(
      { status: "error", message: "Identifiant invalide." },
      { status: 404 },
    );
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json(
      { status: "error", message: "Entreprise introuvable." },
      { status: 404 },
    );
  }

  // Parse VAT rate
  const vats: TaxInput[] = Array.isArray(company.vatRates)
    ? (company.vatRates as any[])
    : typeof company.vatRates === "string"
      ? JSON.parse(company.vatRates || "[]")
      : [];

  const tvaEntry = vats.find(
    (v) => typeof v.taxName === "string" && v.taxName.toLowerCase() === "tva",
  );

  if (!tvaEntry) {
    return NextResponse.json(
      {
        status: "success",
        message: "Aucun taux de TVA défini pour cette entreprise.",
        data: 0,
      },
      { status: 200 },
    );
  }

  const parsePercent = (value: string | number | undefined): Decimal => {
    if (value === undefined || value === null) return new Decimal(0);

    try {
      if (typeof value === "number") {
        return new Decimal(value).div(100);
      }

      let cleaned = String(value)
        .replace(/\s/g, "")
        .replace("%", "")
        .replace(",", ".");

      if (!cleaned || cleaned === "") return new Decimal(0);

      return new Decimal(cleaned).div(100);
    } catch {
      return new Decimal(0);
    }
  };


  const tvaRate = parsePercent(tvaEntry.taxValue);

  if (tvaRate.equals(0)) {
    return NextResponse.json(
      {
        status: "success",
        message: "Aucun taux de TVA actif (0%).",
        data: 0,
      },
      { status: 200 },
    );
  }

  // Récupération des factures
  const invoices = await prisma.invoice.findMany({
    where: {
      companyId,
      amountType: "TTC",
    },
    select: {
      payee: true,
      totalHT: true,
      totalTTC: true,
    },
  });

  // Récupération des bons de commande
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      companyId,
      amountType: "TTC",
    },
    select: {
      payee: true,
      totalHT: true,
      totalTTC: true,
    },
  });

  // Paiements fiscaux déjà déposés
  const fiscalDisbursementsSum = await prisma.dibursement.aggregate({
    _sum: { amount: true },
    where: {
      companyId,
      amountType: "HT",
      category: {
        name: { equals: ADMINISTRATION_CATEGORY, mode: "insensitive" },
      },
      nature: { name: { equals: FISCAL_NATURE, mode: "insensitive" } },
      fiscalObject: { name: { equals: FISCAL_OBJECT, mode: "insensitive" } },
    },
  });


  let tvaCollected = new Decimal(0);

  for (const invoice of invoices) {
    const payee = new Decimal(invoice.payee.toString() ?? 0);
    const totalTTC = new Decimal(invoice.totalTTC.toString() ?? 0);

    if (totalTTC.greaterThan(0)) {
      const totalHT = totalTTC.div(tvaRate.add(1));
      const invoiceTVA = totalTTC.sub(totalHT);

      const proportionPaid = payee.div(totalTTC);

      tvaCollected = tvaCollected.add(invoiceTVA.mul(proportionPaid));
    }
  }

  let tvaDeductible = new Decimal(0);

  for (const po of purchaseOrders) {
    const payee = new Decimal(po.payee.toString() ?? 0);
    const totalTTC = new Decimal(po.totalTTC.toString() ?? 0);

    if (totalTTC.greaterThan(0)) {
      const totalHT = totalTTC.div(tvaRate.add(1));
      const purchaseOrderTVA = totalTTC.sub(totalHT);

      const proportionPaid = payee.div(totalTTC);

      tvaDeductible = tvaDeductible.add(purchaseOrderTVA.mul(proportionPaid));
    }
  }

  const totalFiscalPaid = new Decimal(
    fiscalDisbursementsSum._sum.amount?.toString() ?? 0,
  );

  if (
    tvaCollected.equals(0) &&
    tvaDeductible.equals(0) &&
    totalFiscalPaid.equals(0)
  ) {
    return NextResponse.json(
      {
        status: "success",
        message: "",
        data: 0,
      },
      { status: 200 },
    );
  }

  const tvaDue = tvaCollected.sub(tvaDeductible).sub(totalFiscalPaid);


  return NextResponse.json(
    {
      status: "success",
      message: "",
      data: tvaDue.toNumber().toFixed(2),
    },
    { status: 200 },
  );
}
