import Decimal from "decimal.js";
import {
  CalculateTaxesInput,
  CalculateTaxesResult,
  TaxResult,
} from "@/types/tax.type";

function parseTaxValue(taxValue: string): Decimal {
  const cleaned = taxValue.replace(/[%\s]/g, "");
  return new Decimal(cleaned || "0");
}

function applyDiscount(
  basePrice: Decimal,
  discount: Decimal,
  discountType: "purcent" | "money"
): Decimal {
  if (discountType === "money") {
    return Decimal.max(new Decimal(0), basePrice.minus(discount));
  } else {
    const discountAmount = basePrice.mul(discount).div(100);
    return Decimal.max(new Decimal(0), basePrice.minus(discountAmount));
  }
}

function roundToOneDecimal(value: Decimal): Decimal {
  return value.mul(10).round().div(10);
}

export function calculateTaxes(input: CalculateTaxesInput): CalculateTaxesResult {
  const { items, taxes, discount, amountType = "HT" } = input;

  if (!items || items.length === 0) {
    return {
      taxes: [],
      totalTax: new Decimal(0),
      totalWithTaxes: new Decimal(0),
      totalWithoutTaxes: new Decimal(0),
      currentPrice: new Decimal(0),
      SubTotal: new Decimal(0),
      subTotal: new Decimal(0),
      subtotal: new Decimal(0),
      discountAmount: new Decimal(0),
    };
  }

  const taxResults = new Map<string, TaxResult>();
  let totalHT = new Decimal(0);
  let totalHTWithTaxable = new Decimal(0);
  let globalDiscountAmount = new Decimal(0);

  for (const tax of taxes) {
    taxResults.set(tax.taxName, {
      taxName: tax.taxName,
      appliedRates: [],
      totalTax: new Decimal(0),
      taxPrice: new Decimal(0),
    });
  }

  // Calcul des totaux par article
  for (const item of items) {
    const basePrice = new Decimal(item.price);
    const quantity = new Decimal(Math.max(0.5, item.quantity));
    const itemTotal = basePrice.mul(quantity);

    const itemTotalWithDiscount = applyDiscount(
      itemTotal,
      new Decimal(item.discount),
      item.discountType
    );

    const roundedItemTotal = roundToOneDecimal(itemTotalWithDiscount);

    totalHT = totalHT.plus(roundedItemTotal);

    if (item.hasTax) {
      totalHTWithTaxable = totalHTWithTaxable.plus(roundedItemTotal);
    }
  }

  const SubTotal = roundToOneDecimal(totalHT);

  // Application de la remise globale
  if (discount) {
    const [discountValue, discountType] = discount;
    const decDiscountValue = new Decimal(discountValue);
    const totalHTBeforeDiscount = totalHT;

    if (discountType === "money") {
      globalDiscountAmount = decDiscountValue;
      totalHT = totalHT.minus(globalDiscountAmount);

      if (totalHTWithTaxable.greaterThan(0)) {
        const proportion = totalHTWithTaxable.div(totalHTBeforeDiscount);
        totalHTWithTaxable = totalHTWithTaxable.minus(globalDiscountAmount.mul(proportion));
      }
    } else {
      globalDiscountAmount = totalHT.mul(decDiscountValue).div(100);
      totalHT = totalHT.minus(globalDiscountAmount);
      totalHTWithTaxable = totalHTWithTaxable.minus(
        totalHTWithTaxable.mul(decDiscountValue).div(100)
      );
    }
  }

  totalHT = roundToOneDecimal(totalHT);
  totalHTWithTaxable = roundToOneDecimal(totalHTWithTaxable);
  globalDiscountAmount = roundToOneDecimal(globalDiscountAmount);

  const subTotal = roundToOneDecimal(totalHT);

  // Calcul des taxes uniquement sur les articles taxable
  for (const tax of taxes) {
    const taxResult = taxResults.get(tax.taxName)!;
    const rate = parseTaxValue(tax.taxValue);
    const hasCumulChecked = Boolean(
      Array.isArray(tax.cumul) && tax.cumul.some((c) => c.check)
    );

    taxResult.taxPrice = totalHTWithTaxable;

    if (!hasCumulChecked) {
      const taxAmount = totalHTWithTaxable.mul(rate).div(100);
      taxResult.totalTax = roundToOneDecimal(taxAmount);
      taxResult.appliedRates = [rate.toNumber()];
    } else {
      taxResult.totalTax = new Decimal(0);
      taxResult.appliedRates = [rate.toNumber()];
    }
  }

  // Gestion des taxes cumulées
  for (const tax of taxes) {
    if (!tax.cumul || tax.cumul.length === 0) continue;

    const currentTaxResult = taxResults.get(tax.taxName);
    if (!currentTaxResult) continue;

    const rate = parseTaxValue(tax.taxValue);
    let cumulatedTaxAmount = new Decimal(0);

    for (const c of tax.cumul) {
      if (!c.check) continue;
      const targetTax = taxResults.get(c.name);
      if (!targetTax) continue;

      const cumulAmount = new Decimal(targetTax.totalTax).mul(rate).div(100);
      cumulatedTaxAmount = cumulatedTaxAmount.plus(cumulAmount);
    }

    currentTaxResult.totalTax = roundToOneDecimal(cumulatedTaxAmount);
    taxResults.set(tax.taxName, currentTaxResult);
  }

  // Somme totale des taxes
  let totalTaxAmount = new Decimal(0);
  for (const taxResult of taxResults.values()) {
    totalTaxAmount = totalTaxAmount.plus(new Decimal(taxResult.totalTax));
  }

  totalTaxAmount = roundToOneDecimal(totalTaxAmount);
  const totalWithTaxes = roundToOneDecimal(totalHT.plus(totalTaxAmount));

  const currentPrice = amountType === "TTC" ? totalWithTaxes : totalHT;

  return {
    taxes: Array.from(taxResults.values()),
    totalTax: totalTaxAmount,
    totalWithTaxes,
    totalWithoutTaxes: totalHT,
    currentPrice,
    SubTotal,
    subTotal,
    subtotal: totalHT,
    discountAmount: globalDiscountAmount,
  };
}
