import { createSelectors } from '@/lib/store';
import { create } from "zustand";
import { Role } from '@/lib/generated/prisma';

type DataStore = {
    id: string;
    ids: string[];
    role: Role;
    state: boolean;
    currentCompany: string;
    currency: string;
    setCurrency: (currency: string) => void;
    setCurrentCompany: (currentCompany: string) => void;
    setRole: (role: Role) => void;
    setId: (id: string) => void;
    addId: (id: string) => void;
    removeId: (id: string) => void;
    clearIds: () => void;
    getCurrentCompany: () => string;
    reset: () => void
};

export const useDataStore = createSelectors(
    create<DataStore>()((set, get) => ({
        id: "",
        ids: [],
        role: "USER" as Role,
        currentCompany: "",
        currency: "",
        state: false,

        addId(id) {
            // éviter les doublons
            set((state) => {
                if (state.ids.includes(id)) return { ids: state.ids };
                return { ids: [...state.ids, id] };
            });
        },

        removeId(id) {
            set((state) => ({ ids: state.ids.filter((existingId) => existingId !== id) }));
        },

        setRole(role) {
            set({ role });
        },

        setCurrency(currency) {
            set({ currency });
        },

        setCurrentCompany(currentCompany) {
            set({ currentCompany });
        },

        getCurrentCompany() {
            return get().currentCompany;
        },

        setId(id) {
            set({ id });
        },

        clearIds() {
            set({ ids: [] })
        },

        reset() {
            set({ state: !get().state })
        },
    }))
);
