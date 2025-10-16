import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { BillboardTypeType } from "@/types/billboard-type.types";

type BillboardTypeStore = {
    billboardsType: BillboardTypeType[];
    setBillboardType: (billboardsType: BillboardTypeType[]) => void;
    addBillboardType: (billboardType: BillboardTypeType) => void;
    removeBillboardType: (id: string) => void;
};

const useBillboardTypeStore = createSelectors(
    create<BillboardTypeStore>()((set, get) => ({
        billboardsType: [],
        setBillboardType(billboardsType) {
            set({ billboardsType });
        },
        addBillboardType(billboardType) {
            set({ billboardsType: [...get().billboardsType, billboardType] });
        },
        removeBillboardType(id) {
            set({ billboardsType: get().billboardsType.filter((a) => a.id !== id) });
        },
    }))
);

export default useBillboardTypeStore;
