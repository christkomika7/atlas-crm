import { create } from "zustand";
import { TaxSchemaType } from "@/lib/zod/company.schema";
import { createJSONStorage, persist } from "zustand/middleware";
import { cookieStorage, createSelectors } from "@/lib/store";

interface TaxStore {
    taxs: TaxSchemaType[];
    setTaxs: (taxs: TaxSchemaType[]) => void;
    addTax: (tax: TaxSchemaType) => void;
    updateTax: (index: number, tax: TaxSchemaType) => void;
    deleteTax: (index: number) => void;
    clearTaxs: () => void;
    getTaxs: () => TaxSchemaType[];
}

const useTaxStore = createSelectors(create<TaxStore>()(
    persist(
        (set, get) => ({
            taxs: [],
            setTaxs: (taxs) => set({ taxs }),
            addTax: (tax) => set({ taxs: [...get().taxs, tax] }),
            updateTax: (index, tax) => {
                const current = get().taxs;
                const updated = [...current];
                updated[index] = tax;
                set({ taxs: updated });
            },
            deleteTax: (index) => {
                const current = get().taxs;
                const updated = current.filter((_, i) => i !== index);
                set({ taxs: updated });
            },
            clearTaxs: () => set({ taxs: [] }),
            getTaxs: () => get().taxs,
        }),
        {
            name: "taxs-data",
            storage: createJSONStorage(() => cookieStorage),
        }
    )
));

export default useTaxStore;
