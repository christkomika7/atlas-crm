import { create } from "zustand";
import { createSelectors } from "@/lib/store";

type SearchStore = {
    search: string;
    setSearch: (value: string) => void;
};

const useSearchStore = createSelectors(
    create<SearchStore>()((set, get) => ({
        search: "",
        setSearch(value) {
            set({ search: value })
        },
    }))
);

export default useSearchStore;
