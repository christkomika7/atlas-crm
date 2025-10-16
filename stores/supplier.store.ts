import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { SupplierType } from "@/types/supplier.types";

type SupplierStore = {
    supplier: SupplierType | null;
    getSupplier: () => SupplierType | null;
    setSupplier: (supplier: Partial<SupplierType>) => void;
    updateSupplier: (updatedSupplier: Partial<SupplierType>) => void;
    clearSupplier: () => void;
};

const useSupplierStore = createSelectors(create<SupplierStore>()(
    (set, get) => ({
        supplier: null,
        setSupplier: (supplier) => set({ supplier: supplier as SupplierType }),
        updateSupplier(updatedSupplier) {
            set((state) => ({
                supplier: {
                    ...state.supplier,
                    ...updatedSupplier as SupplierType
                }
            }))
        },
        clearSupplier: () => set({ supplier: null }),
        getSupplier() {
            return get().supplier
        },
    }),
));

export default useSupplierStore;
