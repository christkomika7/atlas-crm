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
  const { items, taxes, taxOperation, discount, amountType = "HT" } = input;

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

  // Initialisation des taxes
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

    if (discountType === "money") {
      const discountAmount = decDiscountValue;
      totalHT = totalHT.minus(discountAmount);

      const proportion = totalHTWithTax.div(totalHT.plus(discountAmount));
      totalHTWithTax = totalHTWithTax.minus(discountAmount.mul(proportion));
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

  // Étape 3 : Calcul des taxes principales
  for (const tax of taxes) {
    const taxResult = taxResults.get(tax.taxName)!;
    const rate = parseTaxValue(tax.taxValue); // ✅ maintenant une seule valeur

    taxResult.taxPrice = totalHTWithTax;

    const taxAmount = totalHTWithTax.mul(rate).div(100);
    taxResult.totalTax = roundToOneDecimal(taxAmount);
    taxResult.appliedRates = [rate.toNumber()];
  }

  // Étape 4 : Application des cumuls
  for (const tax of taxes) {
    if (tax.cumul && tax.cumul.length > 0) {
      const currentTax = taxResults.get(tax.taxName);
      if (!currentTax) continue;

      let cumulatedTaxAmount = new Decimal(0);

      for (const cumul of tax.cumul) {
        if (cumul.check) {
          const otherTax = taxResults.get(cumul.name);
          if (otherTax) {
            const rate = parseTaxValue(tax.taxValue);
            const cumulAmount = new Decimal(otherTax.totalTax)
              .mul(rate)
              .div(100);
            cumulatedTaxAmount = cumulatedTaxAmount.plus(cumulAmount);
          }
        }
      }

      if (cumulatedTaxAmount.greaterThan(0)) {
        taxResults.set(tax.taxName, {
          ...currentTax,
          totalTax: roundToOneDecimal(
            new Decimal(currentTax.totalTax).plus(cumulatedTaxAmount)
          ),
        });
      }
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
