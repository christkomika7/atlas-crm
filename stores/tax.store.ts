import { create } from "zustand";
import { TaxSchemaType } from "@/lib/zod/company.schema";
import { createJSONStorage, persist } from "zustand/middleware";
import { createSelectors } from "@/lib/store";
import { normalizeName } from "@/lib/utils";

interface TaxStore {
    id: string;
    taxs: TaxSchemaType[];
    currentTax: TaxSchemaType | undefined;
    setTaxs: (taxs: TaxSchemaType[]) => void;
    addTax: (tax: Omit<TaxSchemaType, "id">) => void;
    updateTax: (id: string, tax: Omit<TaxSchemaType, "id">) => void;
    deleteTax: (id: string) => void;
    clearTaxs: () => void;
    setCurrentId: (id: string) => void;
}

function dedupeByName(taxs: TaxSchemaType[]) {
    const seen = new Set<string>();
    const result: TaxSchemaType[] = [];
    for (const t of taxs) {
        const key = normalizeName(t.taxName);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(t);
        }
    }
    return result;
}

function ensureIds(taxs: TaxSchemaType[]) {
    return taxs.map((t) => ({
        ...t,
        id: t.id ?? Date.now().toString() + Math.random().toString(36).slice(2, 8),
    }));
}

const useTaxStore = createSelectors(
    create<TaxStore>()(
        persist(
            (set, get) => ({
                taxs: [],
                id: "",
                currentTax: undefined,

                setTaxs: (taxs) => {
                    const withIds = ensureIds(taxs);
                    const normalized = dedupeByName(withIds);
                    set({ taxs: normalized });
                },

                addTax: (tax) => {
                    const nameKey = normalizeName(tax.taxName);
                    const exists = get().taxs.some((t) => normalizeName(t.taxName) === nameKey);
                    if (exists) return;
                    const newTax: TaxSchemaType = {
                        ...tax,
                        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
                    };
                    set({ taxs: [...get().taxs, newTax] });
                },

                updateTax: (id, tax) => {
                    const current = get().taxs;
                    const idx = current.findIndex((t) => t.id === id);
                    if (idx === -1) return;

                    const nameKey = normalizeName(tax.taxName);
                    const conflict = current.some((t, i) => i !== idx && normalizeName(t.taxName) === nameKey);
                    if (conflict) return;

                    const updated = [...current];
                    updated[idx] = { ...updated[idx], ...tax, id };
                    set({ taxs: updated });
                },

                deleteTax: (id) => {
                    const current = get().taxs;
                    const updated = current.filter((t) => t.id !== id);
                    set({ taxs: updated });
                },

                clearTaxs: () => set({ taxs: [] }),

                setCurrentId: (id) => {
                    const currentTax: TaxSchemaType | undefined = get().taxs.find(tax => tax.id === id)
                    set({ id, currentTax })
                },

            }),
            {
                name: "taxs-data",
                storage: createJSONStorage(() => localStorage),
            }
        )
    )
);

export default useTaxStore;
