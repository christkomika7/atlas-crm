import { createSelectors } from '@/lib/store';
import { create } from "zustand";
import { Role } from '@/lib/generated/prisma';


type DataStore = {
    id: string;
    role: Role;
    currentCompany: string;
    currency: string;
    setCurrency: (currency: string) => void;
    setCurrentCompany: (currentCompany: string) => void;
    setRole: (role: Role) => void;
    setId: (id: string) => void;
};

export const useDataStore = createSelectors(create<DataStore>()(
    (set, get) => ({
        employees: [],
        currentCompany: "",
        currency: "",
        id: "",
        role: "USER",
        setRole(role) {
            set({ role: role })
        },
        setCurrency(currency) {
            set({ currency })
        },
        setCurrentCompany(currentCompany) {
            set({ currentCompany })
        },

        getCurrentCompany() {
            return get().currentCompany;
        },

        setId(id) {
            set({ id })
        },
    }),
));