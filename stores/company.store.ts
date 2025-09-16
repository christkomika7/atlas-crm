import { create } from "zustand";
import { CompanySchemaType } from "@/lib/zod/company.schema";
import { createJSONStorage, persist } from "zustand/middleware";
import { cookieStorage, createSelectors } from "@/lib/store";

type CompanyStore = {
    company: CompanySchemaType & { key?: string } | null;
    getCompany: () => CompanySchemaType & { key?: string } | null;
    setCompany: (company: Partial<CompanySchemaType & { key?: string }>) => void;
    isExist: (name: string) => boolean;
    updateCompany: (updatedCompany: Partial<CompanySchemaType>) => void;
    clearCompany: () => void;
};

const useCompanyStore = createSelectors(create<CompanyStore>()(
    persist(
        (set, get) => ({
            company: null,
            setCompany: (company) => set({ company: company as CompanySchemaType }),
            isExist(name) {
                const company = get().company;
                if (company?.companyName === name) return true;
                return false;
            },
            updateCompany(updatedCompany) {
                set((state) => ({
                    company: {
                        ...state.company,
                        ...updatedCompany as CompanySchemaType
                    }
                }))
            },
            clearCompany: () => set({ company: null }),
            getCompany() {
                return get().company
            },
        }),
        {
            name: "company-data",
            storage: createJSONStorage(() => cookieStorage),
        }

    )
));

export default useCompanyStore;
