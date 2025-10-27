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
      subtotal: new Decimal(0),
    };
  }

  const taxResults = new Map<string, TaxResult>();
  let totalHT = new Decimal(0);
  let totalHTWithTax = new Decimal(0);
  let subtotalBeforeDiscount = new Decimal(0);

  // Initialisation des taxes (totalTax = 0 pour commencer)
  for (const tax of taxes) {
    taxResults.set(tax.taxName, {
      taxName: tax.taxName,
      appliedRates: [],
      totalTax: new Decimal(0),
      taxPrice: new Decimal(0),
    });
  }

  // Étape 1 : Calcul du total HT
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
      totalHTWithTax = totalHTWithTax.plus(roundedItemTotal);
    }
  }

  subtotalBeforeDiscount = totalHT;

  // Étape 2 : Application de la remise globale
  if (discount) {
    const [discountValue, discountType] = discount;
    const decDiscountValue = new Decimal(discountValue);
    const totalHTBeforeDiscount = totalHT; // Sauvegarde pour le calcul de proportion

    if (discountType === "money") {
      const discountAmount = decDiscountValue;
      totalHT = totalHT.minus(discountAmount);

      if (totalHTBeforeDiscount.greaterThan(0)) {
        const proportion = totalHTWithTax.div(totalHTBeforeDiscount);
        totalHTWithTax = totalHTWithTax.minus(discountAmount.mul(proportion));
      }
    } else {
      const discountAmount = totalHT.mul(decDiscountValue).div(100);
      totalHT = totalHT.minus(discountAmount);
      totalHTWithTax = totalHTWithTax.minus(
        totalHTWithTax.mul(decDiscountValue).div(100)
      );
    }
  }

  totalHT = roundToOneDecimal(totalHT);
  totalHTWithTax = roundToOneDecimal(totalHTWithTax);

  // Si aucun montant taxable spécifique, on considère le totalHT comme base taxable.
  const taxableAmount = totalHTWithTax.greaterThan(0) ? totalHTWithTax : totalHT;

  // Étape 3 : Calcul des taxes appliquées SUR LA BASE
  // Règle : si une taxe possède un champ `cumul` non vide (avec des checks),
  // on considère ici que sa valeur principale SUR LA BASE = 0 (elle agit comme taxe "cumulée").
  // Les taxes sans cumul sont calculées normalement sur la base.
  for (const tax of taxes) {
    const taxResult = taxResults.get(tax.taxName)!;
    const rate = parseTaxValue(tax.taxValue);
    const hasCumulChecked = Boolean(
      Array.isArray(tax.cumul) && tax.cumul.some((c) => c.check)
    );

    taxResult.taxPrice = taxableAmount;

    if (!hasCumulChecked) {
      // Taxe normale appliquée sur la base
      const taxAmount = taxableAmount.mul(rate).div(100);
      taxResult.totalTax = roundToOneDecimal(taxAmount);
      taxResult.appliedRates = [rate.toNumber()];
    } else {
      // Taxe dont le montant principal sur la base est 0 (sera calculée via cumuls)
      taxResult.totalTax = new Decimal(0);
      taxResult.appliedRates = [rate.toNumber()];
    }
  }

  // Étape 4 : Calcul des cumuls (chaque taxe qui cumule sur d'autres)
  // On utilise les totalTax déjà calculés pour les taxes de base.
  for (const tax of taxes) {
    if (!tax.cumul || tax.cumul.length === 0) continue;

    const currentTaxResult = taxResults.get(tax.taxName);
    if (!currentTaxResult) continue;

    const rate = parseTaxValue(tax.taxValue);

    let cumulatedTaxAmount = new Decimal(0);

    for (const c of tax.cumul) {
      if (!c.check) continue;
      const other = taxResults.get(c.name);
      if (!other) continue;

      // On applique le pourcentage (rate) SUR le montant de la taxe ciblée (other.totalTax)
      // Exemple : CA 2% en cumul sur TVA -> cumulAmount = TVA_total * 2% = 200 * 2% = 4
      const cumulAmount = new Decimal(other.totalTax).mul(rate).div(100);
      cumulatedTaxAmount = cumulatedTaxAmount.plus(cumulAmount);
    }

    if (cumulatedTaxAmount.greaterThan(0)) {
      currentTaxResult.totalTax = roundToOneDecimal(
        new Decimal(currentTaxResult.totalTax).plus(cumulatedTaxAmount)
      );
      // on écrit à nouveau la map
      taxResults.set(tax.taxName, currentTaxResult);
    }
  }

  // Étape 5 : Totaux finaux
  let totalTaxAmount = new Decimal(0);

  for (const taxResult of taxResults.values()) {
    totalTaxAmount = totalTaxAmount.plus(new Decimal(taxResult.totalTax));
  }

  totalTaxAmount = roundToOneDecimal(totalTaxAmount);
  const totalWithTaxes = roundToOneDecimal(totalHT.plus(totalTaxAmount));

  const currentPrice = amountType === "TTC" ? totalWithTaxes : totalHT;
  const subtotal = roundToOneDecimal(subtotalBeforeDiscount);

  return {
    taxes: Array.from(taxResults.values()),
    totalTax: totalTaxAmount,
    totalWithTaxes,
    totalWithoutTaxes: totalHT,
    currentPrice,
    subtotal,
  };
}
