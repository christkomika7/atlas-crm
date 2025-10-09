import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { BillboardType } from "@/types/billboard.types";

type BillboardStore = {
    currentSpaceType?: "private" | "public";
    billboard: BillboardType | null;
    setCurrentSpaceType: (spaceType: "private" | "public") => void;
    setBillboard: (billboard: Partial<BillboardType>) => void;
    updateBillboard: (updatedBillboard: Partial<BillboardType>) => void;
    clearBillboard: () => void;
};

const useBillboardStore = createSelectors(create<BillboardStore>()(
    (set) => ({
        currentSpaceType: undefined,
        billboard: null,
        setCurrentSpaceType(spaceType) {
            set({ currentSpaceType: spaceType })
        },
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

export default useBillboardStore;
