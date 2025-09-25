// ---------- types ----------
type Item = {
    name: string;
    price: string; // ex: "300000"
    discountType: "purcent" | "money";
    discount: number;
    quantity: number;
};

export type TaxInput = {
    taxName: string;
    taxValue: string[]; // ex: ["2%", "3%"]
    hasApplicableToAll: boolean;
    taxType?: "HT" | "TTC"; // meta: si "TTC" => ces taux *peuvent* être inclus si pricesIncludeTaxes === true
    cumul?: { id: number; name: string; check: boolean }[];
};

export type TaxResult = {
    taxName: string;
    appliedRates: number[];
    totalTax: number;
    taxPrice: number;
    taxType?: "HT" | "TTC";
};

export type ItemTaxBreakdown = {
    itemName: string;
    baseHTBeforeDiscount: number; // base utilisée pour calcul taxe (avant remise)
    baseHTAfterDiscount: number; // base HT après remise (sert aux totaux HT)
    quantity: number;
    taxResults: {
        taxName: string;
        appliedRates: number[];
        taxPerUnit: number; // taxe calculée par unité (sur base BEFORE discount)
        taxTotalForItem: number; // taxe appliquée (tenant compte de hasApplicableToAll)
        applied: boolean; // si cette ligne est celle où la taxe a été appliquée (utile pour hasApplicableToAll=false)
    }[];
    totalItemTax: number;
    totalItemPriceWithTax: number; // baseAfterDiscount*qty + totalItemTax
};

export type CalculateTaxesResult = {
    taxes: TaxResult[];
    totalTax: number;
    totalWithTaxes: number;
    totalWithoutTaxes: number;
    itemBreakdown: ItemTaxBreakdown[];
};

// ---------- helpers ----------
function parseRateString(s: string): number {
    return parseFloat(String(s).replace(/\s|%/g, "")) || 0;
}
function round(value: number, decimals = 3): number {
    return parseFloat(value.toFixed(decimals));
}

/**
 * Convertit un prix TTC en HT en retirant les rates fournis.
 * Si taxOperation === "cumul" on retire (1 + sumRates/100).
 * Si "sequence" on divise successivement par (1 + r/100).
 */
function htFromTtc(priceTTC: number, rates: number[], taxOperation: "sequence" | "cumul"): number {
    if (!rates || rates.length === 0) return priceTTC;
    if (taxOperation === "cumul") {
        const totalRate = rates.reduce((s, r) => s + r, 0);
        return priceTTC / (1 + totalRate / 100);
    } else {
        let base = priceTTC;
        for (const r of rates) {
            base = base / (1 + r / 100);
        }
        return base;
    }
}

/**
 * Calcule la taxe par unité en se basant sur baseHT (avant remise).
 * Supporte "cumul" (somme des taux) et "sequence" (taxe sur taxe).
 */
function taxPerUnitFromRates(baseHT: number, rates: number[], taxOperation: "sequence" | "cumul"): number {
    if (!rates || rates.length === 0) return 0;
    if (rates.length === 1) return baseHT * (rates[0] / 100);
    if (taxOperation === "cumul") {
        const totalRate = rates.reduce((s, r) => s + r, 0);
        return baseHT * (totalRate / 100);
    } else {
        let tmp = baseHT;
        let taxSum = 0;
        for (const r of rates) {
            const portion = tmp * (r / 100);
            taxSum += portion;
            tmp += portion;
        }
        return taxSum;
    }
}

// ---------- fonction principale ----------
/**
 * pricesIncludeTaxes: boolean (default false)
 *   - false => on considère que le price fourni est HT (comportement par défaut).
 *   - true  => on considère que le price fourni contient les taxes marquées taxType === "TTC"
 */
export function calculateTaxes(params: {
    items: Item[];
    taxes: TaxInput[];
    taxOperation: "sequence" | "cumul";
    decimals?: number; // par défaut 3
    pricesIncludeTaxes?: boolean; // IMPORTANT: par défaut false (price est HT)
}): CalculateTaxesResult {
    const { items, taxes, taxOperation, decimals = 3, pricesIncludeTaxes = false } = params;

    // préparer map des taxes
    const taxesMap: Record<string, TaxResult> = {};
    for (const t of taxes) {
        taxesMap[t.taxName] = {
            taxName: t.taxName,
            appliedRates: t.taxValue.map(parseRateString),
            totalTax: 0,
            taxPrice: 0,
            taxType: t.taxType,
        };
    }

    let totalWithoutTaxes = 0;
    let totalTax = 0;
    let totalWithTaxes = 0;
    const itemBreakdown: ItemTaxBreakdown[] = [];

    // Si pricesIncludeTaxes === true, on va enlever les taux marqués TTC du price
    const ratesIncludedInPriceAllTaxes: number[] = pricesIncludeTaxes
        ? taxes.filter((t) => t.taxType === "TTC").flatMap((t) => t.taxValue.map(parseRateString))
        : [];

    // Map pour éviter d'appliquer plusieurs fois une taxe "non applicable à tous"
    const appliedOnce: Record<string, boolean> = {};

    for (const item of items) {
        const qty = item.quantity;
        const priceNum = parseFloat(item.price) || 0;

        // 1) déterminer la base HT AVANT remise
        let baseHTBeforeDiscount = ratesIncludedInPriceAllTaxes.length
            ? htFromTtc(priceNum, ratesIncludedInPriceAllTaxes, taxOperation)
            : priceNum;
        baseHTBeforeDiscount = round(baseHTBeforeDiscount, decimals);

        // 2) applique la remise SUR la base HT (la remise N'AFFECTE PAS les taxes)
        let discountAmount = 0;
        if (item.discountType === "purcent") {
            discountAmount = baseHTBeforeDiscount * (item.discount / 100);
        } else {
            discountAmount = item.discount;
        }
        if (discountAmount < 0) discountAmount = 0;
        let baseHTAfterDiscount = baseHTBeforeDiscount - discountAmount;
        if (baseHTAfterDiscount < 0) baseHTAfterDiscount = 0;
        baseHTAfterDiscount = round(baseHTAfterDiscount, decimals);

        // 3) calcul des taxes pour cet item (chaque taxe est calculée sur baseHTBeforeDiscount)
        const taxResultsForItem: ItemTaxBreakdown["taxResults"] = [];
        let totalItemTax = 0;

        for (const tax of taxes) {
            const rates = tax.taxValue.map(parseRateString);
            const taxPerUnit = round(taxPerUnitFromRates(baseHTBeforeDiscount, rates, taxOperation), decimals);

            // si hasApplicableToAll === false => on ne doit appliquer cette taxe qu'une seule fois
            let taxTotalForThisLine = 0;
            let applied = true;

            if (tax.hasApplicableToAll) {
                taxTotalForThisLine = round(taxPerUnit * qty, decimals);
            } else {
                // appliquer une seule fois pour l'ensemble des billets
                if (!appliedOnce[tax.taxName]) {
                    taxTotalForThisLine = round(taxPerUnit * 1, decimals);
                    appliedOnce[tax.taxName] = true;
                } else {
                    taxTotalForThisLine = 0;
                    applied = false;
                }
            }

            // maj agrégats globaux par taxe (si la taxe n'est pas appliquée sur cette ligne, on ajoute 0)
            taxesMap[tax.taxName].totalTax = round(taxesMap[tax.taxName].totalTax + taxTotalForThisLine, decimals);

            // taxPrice: base taxable cumulée (si hasApplicableToAll => base * qty, sinon une seule base)
            if (tax.hasApplicableToAll) {
                taxesMap[tax.taxName].taxPrice = round(
                    taxesMap[tax.taxName].taxPrice + baseHTBeforeDiscount * qty,
                    decimals
                );
            } else {
                if (applied) {
                    taxesMap[tax.taxName].taxPrice = round(
                        taxesMap[tax.taxName].taxPrice + baseHTBeforeDiscount,
                        decimals
                    );
                }
                // sinon on n'ajoute pas la base (déjà prise en compte une fois)
            }

            taxResultsForItem.push({
                taxName: tax.taxName,
                appliedRates: rates,
                taxPerUnit,
                taxTotalForItem: taxTotalForThisLine,
                applied,
            });

            totalItemTax = round(totalItemTax + taxTotalForThisLine, decimals);
        }

        const totalItemPriceWithTax = round(baseHTAfterDiscount * qty + totalItemTax, decimals);

        // cumuls globaux
        totalWithoutTaxes = round(totalWithoutTaxes + baseHTAfterDiscount * qty, decimals);
        totalTax = round(totalTax + totalItemTax, decimals);
        totalWithTaxes = round(totalWithTaxes + totalItemPriceWithTax, decimals);

        itemBreakdown.push({
            itemName: item.name,
            baseHTBeforeDiscount,
            baseHTAfterDiscount,
            quantity: qty,
            taxResults: taxResultsForItem,
            totalItemTax,
            totalItemPriceWithTax,
        });
    }

    // transformer taxesMap => tableau
    const taxesArray: TaxResult[] = Object.values(taxesMap).map((t) => ({
        ...t,
        totalTax: round(t.totalTax, decimals),
        taxPrice: round(t.taxPrice, decimals),
    }));

    return {
        taxes: taxesArray,
        totalTax: round(totalTax, decimals),
        totalWithTaxes: round(totalWithTaxes, decimals),
        totalWithoutTaxes: round(totalWithoutTaxes, decimals),
        itemBreakdown,
    };
}
