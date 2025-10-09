import { create } from "zustand";
import { createJSONStorage, createSelectors, persist } from "@/lib/store";

type TabStore = {
    tabs: Record<string, number>;
    setTab: (tabId: string, index: number) => void;
    getTab: (tabId: string) => number | undefined;
};

const useTabStore = createSelectors(
    create<TabStore>()(
        persist(
            (set, get) => ({
                tabs: {},
                setTab: (tabId, index) => {
                    set({ tabs: { ...get().tabs, [tabId]: index } });
                },
                getTab: (tabId) => get().tabs[tabId],
            }),
            {
                name: "tab-storage",
                storage: createJSONStorage(() => localStorage),
            }
        )
    )
);


export default useTabStore;