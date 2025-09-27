import { CalculateTaxesInput, CalculateTaxesResult, TaxInput, TaxResult } from "@/types/tax.type";

/**
 * Convertit une string de taxe en nombre
 * Ex: "20%" -> 20, "0.5" -> 0.5
 */
function parseTaxValue(taxValue: string): number {
    const cleaned = taxValue.replace(/[%\s]/g, "");
    return parseFloat(cleaned) || 0;
}

/**
 * Calcule le prix HT à partir d'un prix TTC et d'un taux de taxe
 */
function calculateHTFromTTC(priceTTC: number, taxRate: number): number {
    const taxe = priceTTC * (taxRate / 100);
    return priceTTC - taxe;
}


/**
 * Applique la réduction sur le prix de base (HT)
 */
function applyDiscount(basePrice: number, discount: number, discountType: "purcent" | "money"): number {
    if (discountType === "money") {
        return Math.max(0, basePrice - discount);
    } else {
        const discountAmount = (basePrice * discount) / 100;
        return Math.max(0, basePrice - discountAmount);
    }
}

/**
 * Calcule les taux de taxe selon l'opération (séquence ou cumul)
 */
function calculateTaxRates(taxValues: string[], operation: "sequence" | "cumul"): { rates: number[], total: number } {
    const rates = taxValues.map(parseTaxValue);

    if (operation === "cumul") {
        const total = rates.reduce((sum, rate) => sum + rate, 0);
        return { rates, total };
    } else {
        // Séquence : application successive des taux
        let total = 0;
        let currentBase = 100;

        for (const rate of rates) {
            total += (currentBase * rate) / 100;
            currentBase += (currentBase * rate) / 100;
        }

        return { rates, total };
    }
}

/**
 * Calcule les taxes cumulées entre différentes taxes
 */
function calculateCumulatedTaxes(taxes: TaxInput[], taxResults: Map<string, TaxResult>): Map<string, TaxResult> {
    const updatedResults = new Map(taxResults);

    for (const tax of taxes) {
        if (tax.cumul && tax.cumul.length > 0) {
            const currentTax = updatedResults.get(tax.taxName);
            if (!currentTax) continue;

            let cumulatedTax = 0;
            const cumulatedWith: string[] = [];

            for (const cumul of tax.cumul) {
                if (cumul.check) {
                    const otherTax = updatedResults.get(cumul.name);
                    if (otherTax) {
                        cumulatedTax += otherTax.totalTax;
                        cumulatedWith.push(cumul.name);
                    }
                }
            }

            // Mise à jour de la taxe avec cumul
            updatedResults.set(tax.taxName, {
                ...currentTax,
                totalTax: currentTax.totalTax + cumulatedTax
            });
        }
    }

    return updatedResults;
}

/**
 * Arrondit un nombre à 1 chiffre après la virgule
 */
function roundToOneDecimal(value: number): number {
    return Math.round(value * 10) / 10;
}

/**
 * Fonction principale de calcul des taxes
 */
export function calculateTaxes(input: CalculateTaxesInput): CalculateTaxesResult {
    const { items, taxes, taxOperation, discount } = input;

    if (!items || items.length === 0) {
        return {
            taxes: [],
            totalTax: 0,
            totalWithTaxes: 0,
            totalWithoutTaxes: 0
        };
    }

    const taxResults = new Map<string, TaxResult>();
    let totalWithoutTaxes = 0;
    let totalTaxAmount = 0;

    // Initialisation des résultats de taxes
    for (const tax of taxes) {
        taxResults.set(tax.taxName, {
            taxName: tax.taxName,
            appliedRates: [],
            totalTax: 0,
            taxPrice: 0,
            taxType: tax.taxType
        });
    }

    // Traitement de chaque article
    for (const item of items) {
        const basePrice = parseFloat(item.price) || 0;
        const quantity = Math.max(1, item.quantity);

        // Traitement de chaque taxe pour cet article
        for (const tax of taxes) {
            const taxResult = taxResults.get(tax.taxName)!;
            const { rates, total: taxRate } = calculateTaxRates(tax.taxValue, taxOperation);

            let basePriceHT: number;

            // Détermination du prix HT selon le type de CETTE taxe spécifique
            if (tax.taxType === "TTC") {
                // Cette taxe spécifique est incluse dans le prix
                basePriceHT = calculateHTFromTTC(basePrice, taxRate);

            } else {
                // Cette taxe est HT : le prix donné n'inclut pas cette taxe
                basePriceHT = basePrice;
            }

            const itemTaxAmount = basePrice * (taxRate / 100)


            // Application de la quantité et hasApplicableToAll pour la taxe
            let finalTaxAmount: number;
            if (tax.hasApplicableToAll) {
                // Taxe appliquée sur chaque unité
                finalTaxAmount = itemTaxAmount * quantity;
            } else {
                // Taxe appliquée une seule fois peu importe la quantité
                finalTaxAmount = itemTaxAmount;
            }

            // Mise à jour des résultats avec arrondissement
            taxResult.appliedRates = rates;
            taxResult.totalTax += roundToOneDecimal(finalTaxAmount);
            taxResult.taxPrice += roundToOneDecimal(basePriceHT * quantity);
        }

        // Calcul du prix HT avec réduction (pour le total sans taxes)
        // On utilise le prix de base comme HT s'il n'y a pas de taxe TTC
        let itemBasePriceHT = basePrice;
        const ttcTax = taxes.find(tax => tax.taxType === "TTC");
        if (ttcTax) {
            const { total: ttcTaxRate } = calculateTaxRates(ttcTax.taxValue, taxOperation);
            itemBasePriceHT = calculateHTFromTTC(basePrice, ttcTaxRate);
        }

        const discountedPriceHT = applyDiscount(itemBasePriceHT, item.discount, item.discountType);
        totalWithoutTaxes += roundToOneDecimal(discountedPriceHT * quantity);
    }

    // Application des cumuls entre taxes
    const finalTaxResults = calculateCumulatedTaxes(taxes, taxResults);

    // Calcul des totaux finaux avec arrondissement
    for (const taxResult of finalTaxResults.values()) {
        taxResult.totalTax = roundToOneDecimal(taxResult.totalTax);
        taxResult.taxPrice = roundToOneDecimal(taxResult.taxPrice);
        totalTaxAmount += taxResult.totalTax;
    }

    if (!discount) {
        totalWithoutTaxes = roundToOneDecimal(totalWithoutTaxes);
        totalTaxAmount = roundToOneDecimal(totalTaxAmount);
        const totalWithTaxes = roundToOneDecimal(totalWithoutTaxes + totalTaxAmount);

        return {
            taxes: Array.from(finalTaxResults.values()),
            totalTax: totalTaxAmount,
            totalWithTaxes,
            totalWithoutTaxes
        };
    }

    const [discountValue, discountType] = discount;

    let discountPrice = 0;

    if (discountType === "money") {
        discountPrice = totalWithoutTaxes - discountValue;
    } else {
        discountPrice = totalWithoutTaxes * (discountValue / 100);
    }

    totalWithoutTaxes = roundToOneDecimal(discountPrice);
    totalTaxAmount = roundToOneDecimal(totalTaxAmount);
    const totalWithTaxes = roundToOneDecimal(totalWithoutTaxes + totalTaxAmount);

    return {
        taxes: Array.from(finalTaxResults.values()),
        totalTax: totalTaxAmount,
        totalWithTaxes,
        totalWithoutTaxes
    };
}
