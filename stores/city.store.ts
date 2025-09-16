import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { CityType } from "@/types/city.types";

type CityStore = {
    cities: CityType[];
    setCity: (cities: CityType[]) => void;
    addCity: (city: CityType) => void;
    removeCity: (id: string) => void;
};

const useCityStore = createSelectors(
    create<CityStore>()((set, get) => ({
        cities: [],
        setCity(cities) {
            set({ cities });
        },
        addCity(city) {
            const exists = get().cities.some((p) => p.id === city.id);
            if (!exists) {
                set({ cities: [...get().cities, city] });
            }
        },
        removeCity(id) {
            set({ cities: get().cities.filter((a) => a.id !== id) });
        },
    }))
);

export default useCityStore;
