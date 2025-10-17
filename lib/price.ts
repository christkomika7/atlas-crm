import Decimal from "decimal.js";
import {
    CalculateTaxesInput,
    CalculateTaxesResult,
    TaxInput,
    TaxResult
} from "@/types/tax.type";

/**
 * Convertit une string de taxe en nombre
 * Ex: "20%" -> 20, "0.5" -> 0.5
 */
function parseTaxValue(taxValue: string): Decimal {
    const cleaned = taxValue.replace(/[%\s]/g, "");
    return new Decimal(cleaned || "0");
}

/**
 * Calcule le prix HT à partir d'un prix TTC et d'un taux de taxe
 */
function calculateHTFromTTC(priceTTC: Decimal, taxRate: Decimal): Decimal {
    const taxFraction = taxRate.div(100);
    const priceHT = priceTTC.div(taxFraction.plus(1));
    return priceHT;
}

/**
 * Applique la réduction sur le prix de base (HT)
 */
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

/**
 * Calcule les taux de taxe selon l'opération (séquence ou cumul)
 */
function calculateTaxRates(
    taxValues: string[],
    operation: "sequence" | "cumul"
): { rates: Decimal[]; total: Decimal } {
    const rates = taxValues.map(parseTaxValue);

    if (operation === "cumul") {
        const total = rates.reduce((sum, rate) => sum.plus(rate), new Decimal(0));
        return { rates, total };
    } else {
        // Séquence : application successive des taux
        let total = new Decimal(0);
        let currentBase = new Decimal(100);

        for (const rate of rates) {
            const increment = currentBase.mul(rate).div(100);
            total = total.plus(increment);
            currentBase = currentBase.plus(increment);
        }

        return { rates, total };
    }
}

/**
 * Calcule les taxes cumulées entre différentes taxes
 */
function calculateCumulatedTaxes(
    taxes: TaxInput[],
    taxResults: Map<string, TaxResult>
): Map<string, TaxResult> {
    const updatedResults = new Map(taxResults);

    for (const tax of taxes) {
        if (tax.cumul && tax.cumul.length > 0) {
            const currentTax = updatedResults.get(tax.taxName);
            if (!currentTax) continue;

            let cumulatedTax = new Decimal(0);
            const cumulatedWith: string[] = [];

            for (const cumul of tax.cumul) {
                if (cumul.check) {
                    const otherTax = updatedResults.get(cumul.name);
                    if (otherTax) {
                        cumulatedTax = cumulatedTax.plus(new Decimal(otherTax.totalTax));
                        cumulatedWith.push(cumul.name);
                    }
                }
            }

            // Mise à jour de la taxe avec cumul
            updatedResults.set(tax.taxName, {
                ...currentTax,
                totalTax: new Decimal(currentTax.totalTax).plus(cumulatedTax)
            });
        }
    }

    return updatedResults;
}

/**
 * Arrondit un nombre à 1 chiffre après la virgule
 */
function roundToOneDecimal(value: Decimal): Decimal {
    return value.mul(10).round().div(10);
}

/**
 * Fonction principale de calcul des taxes
 */
export function calculateTaxes(input: CalculateTaxesInput): CalculateTaxesResult {
    const { items, taxes, taxOperation, discount } = input;

    if (!items || items.length === 0) {
        return {
            taxes: [],
            totalTax: new Decimal(0),
            totalWithTaxes: new Decimal(0),
            totalWithoutTaxes: new Decimal(0)
        };
    }

    const taxResults = new Map<string, TaxResult>();
    let totalWithoutTaxes = new Decimal(0);
    let totalTaxAmount = new Decimal(0);

    // Initialisation des résultats de taxes
    for (const tax of taxes) {
        taxResults.set(tax.taxName, {
            taxName: tax.taxName,
            appliedRates: [],
            totalTax: new Decimal(0),
            taxPrice: new Decimal(0),
        });
    }

    // Traitement de chaque article
    for (const item of items) {
        console.log({ item })
        const basePrice = new Decimal(item.price);
        const quantity = new Decimal(Math.max(0.5, item.quantity)).toNumber();

        // Traitement de chaque taxe pour cet article
        for (const tax of taxes) {
            const taxResult = taxResults.get(tax.taxName)!;
            const { rates, total: taxRate } = calculateTaxRates(
                tax.taxValue,
                taxOperation
            );

            let basePriceHT: Decimal;

            if (input.amountType === "TTC") {
                basePriceHT = calculateHTFromTTC(basePrice, taxRate);
            } else {
                basePriceHT = basePrice;
            }
            // Détermination du prix HT selon le type de CETTE taxe spécifique
            // if (tax.taxType === "TTC") {
            //     basePriceHT = calculateHTFromTTC(basePrice, taxRate);
            // } else {
            //     basePriceHT = basePrice;
            // }

            const itemTaxAmount = basePriceHT.mul(taxRate).div(100);

            // Application de la quantité et hasApplicableToAll pour la taxe
            let finalTaxAmount: Decimal = itemTaxAmount;

            // Mise à jour des résultats avec arrondissement
            const roundedTax = roundToOneDecimal(finalTaxAmount);
            const roundedBase = roundToOneDecimal(basePriceHT.mul(quantity));

            taxResult.appliedRates = rates.map(r => r.toNumber());
            taxResult.totalTax = new Decimal(taxResult.totalTax).plus(roundedTax);
            taxResult.taxPrice = new Decimal(taxResult.taxPrice).plus(roundedBase);
        }

        // Calcul du prix HT avec réduction (pour le total sans taxes)
        let itemBasePriceHT = new Decimal(basePrice);

        const discountedPriceHT = applyDiscount(
            itemBasePriceHT,
            new Decimal(item.discount),
            item.discountType
        );

        totalWithoutTaxes = totalWithoutTaxes.plus(
            roundToOneDecimal(discountedPriceHT.mul(quantity))
        );
    }

    // Application des cumuls entre taxes
    const finalTaxResults = calculateCumulatedTaxes(taxes, taxResults);

    // Calcul des totaux finaux avec arrondissement
    for (const taxResult of finalTaxResults.values()) {
        const totalTax = new Decimal(taxResult.totalTax);
        const taxPrice = new Decimal(taxResult.taxPrice);

        taxResult.totalTax = roundToOneDecimal(totalTax);
        taxResult.taxPrice = roundToOneDecimal(taxPrice);

        totalTaxAmount = totalTaxAmount.plus(totalTax);
    }

    // Application d'une remise globale
    if (discount) {
        const [discountValue, discountType] = discount;
        const decDiscountValue = new Decimal(discountValue);

        if (discountType === "money") {
            totalWithoutTaxes = totalWithoutTaxes.minus(decDiscountValue);
        } else {
            totalWithoutTaxes = totalWithoutTaxes.minus(
                totalWithoutTaxes.mul(decDiscountValue).div(100)
            );
        }
    }

    totalWithoutTaxes = roundToOneDecimal(totalWithoutTaxes);
    totalTaxAmount = roundToOneDecimal(totalTaxAmount);
    const totalWithTaxes = roundToOneDecimal(totalWithoutTaxes.plus(totalTaxAmount));

    return {
        taxes: Array.from(finalTaxResults.values()),
        totalTax: totalTaxAmount,
        totalWithTaxes: totalWithTaxes,
        totalWithoutTaxes: totalWithoutTaxes
    };
}
