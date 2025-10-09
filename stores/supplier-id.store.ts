import { create } from "zustand";
import { createSelectors } from "@/lib/store";



type SupplierIdStore = {
    supplierId: string;
    setSupplierId: (id: string) => void;
};

const useSupplierIdStore = createSelectors(
    create<SupplierIdStore>()((set) => ({
        supplierId: "",
        setSupplierId(id) {
            set({ supplierId: id })
        },
    }))
);

export default useSupplierIdStore;
