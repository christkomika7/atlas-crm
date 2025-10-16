import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { AreaType } from "@/types/area.types";

type AreaStore = {
    areas: AreaType[];
    setArea: (areas: AreaType[]) => void;
    addArea: (area: AreaType) => void;
    removeArea: (id: string) => void;
};

const useAreaStore = createSelectors(
    create<AreaStore>()((set, get) => ({
        areas: [],
        setArea(areas) {
            set({ areas });
        },
        addArea(area) {
            const exists = get().areas.some((p) => p.id === area.id);
            if (!exists) {
                set({ areas: [...get().areas, area] });
            }
        },
        removeArea(id) {
            set({ areas: get().areas.filter((a) => a.id !== id) });
        },
    }))
);

export default useAreaStore;
