import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { BaseType } from "@/types/base.types";

type BillboardTypeStore = {
    billboardsType: BaseType[];
    setBillboardType: (billboardsType: BaseType[]) => void;
    addBillboardType: (billboardType: BaseType) => void;
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
