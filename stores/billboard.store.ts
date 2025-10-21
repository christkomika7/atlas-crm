import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { BillboardType } from "@/types/billboard.types";
import { BaseType } from "@/types/base.types";

type BillboardStore = {
    currentSpaceType?: "private" | "public";
    billboard: BillboardType | null;
    displayBoards: BaseType[];
    structureTypes: BaseType[];
    lessorTypes: BaseType[];

    setCurrentSpaceType: (spaceType: "private" | "public") => void;
    setBillboard: (billboard: Partial<BillboardType>) => void;
    updateBillboard: (updatedBillboard: Partial<BillboardType>) => void;
    clearBillboard: () => void;

    setDisplayBoards: (datas: BaseType[]) => void;
    addDisplayBoard: (data: BaseType) => void;
    removeDisplayBoard: (id: string) => void;

    setStructureType: (datas: BaseType[]) => void;
    addStructureType: (data: BaseType) => void;
    removeStructureType: (id: string) => void;

    setLessorType: (datas: BaseType[]) => void;
    addLessorType: (data: BaseType) => void;
    removeLessorType: (id: string) => void;
};

const useBillboardStore = createSelectors(create<BillboardStore>()((set, get) => ({
    currentSpaceType: undefined,
    billboard: null,
    displayBoards: [],
    structureTypes: [],
    lessorTypes: [],

    setCurrentSpaceType(spaceType) {
        set({ currentSpaceType: spaceType });
    },

    setBillboard(billboard) {
        set({ billboard: billboard as BillboardType });
    },

    updateBillboard(updatedBillboard) {
        set((state) => ({
            billboard: { ...state.billboard, ...updatedBillboard } as BillboardType
        }));
    },

    clearBillboard() {
        set({ billboard: null });
    },

    // DisplayBoards
    setDisplayBoards(datas) {
        set({ displayBoards: datas });
    },
    addDisplayBoard(data) {
        const exists = get().displayBoards.some((p) => p.id === data.id);
        if (!exists) {
            set({ displayBoards: [...get().displayBoards, data] });
        }
    },
    removeDisplayBoard(id) {
        set({ displayBoards: get().displayBoards.filter((a) => a.id !== id) });
    },

    // StructureType
    setStructureType(datas) {
        set({ structureTypes: datas });
    },
    addStructureType(data) {
        const exists = get().structureTypes.some((p) => p.id === data.id);
        if (!exists) {
            set({ structureTypes: [...get().structureTypes, data] });
        }
    },
    removeStructureType(id) {
        set({ structureTypes: get().structureTypes.filter((a) => a.id !== id) });
    },

    // LessorType
    setLessorType(datas) {
        set({ lessorTypes: datas });
    },
    addLessorType(data) {
        const exists = get().lessorTypes.some((p) => p.id === data.id);
        if (!exists) {
            set({ lessorTypes: [...get().lessorTypes, data] });
        }
    },
    removeLessorType(id) {
        set({ lessorTypes: get().lessorTypes.filter((a) => a.id !== id) });
    },

})));

export default useBillboardStore;
