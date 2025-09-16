import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { BillboardType } from "@/types/billboard.types";

type ClientStore = {
    billboard: BillboardType | null;
    setBillboard: (billboard: Partial<BillboardType>) => void;
    updateBillboard: (updatedBillboard: Partial<BillboardType>) => void;
    clearBillboard: () => void;
};

const useClientStore = createSelectors(create<ClientStore>()(
    (set) => ({
        billboard: null,
        setBillboard: (billboard) => set({ billboard: billboard as BillboardType }),
        updateBillboard(updatedBillboard) {
            set((state) => ({
                billboard: {
                    ...state.billboard,
                    ...updatedBillboard as BillboardType
                }
            }))
        },
        clearBillboard: () => set({ billboard: null }),
    }),
));

export default useClientStore;
