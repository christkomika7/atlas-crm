import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { FiscalObjectType, SourceType, TransactionCategoryType, TransactionNatureType, UserActionType } from "@/types/transaction.type";

type TransactionStore = {
    categories: TransactionCategoryType[];
    natures: TransactionNatureType[];
    sources: SourceType[];
    userActions: UserActionType[];
    fiscalObjects: FiscalObjectType[]

    setCategories: (categories: TransactionCategoryType[]) => void;
    addCategory: (category: TransactionCategoryType) => void;
    removeCategory: (id: string) => void;

    setNatures: (natures: TransactionNatureType[]) => void;
    addNature: (nature: TransactionNatureType) => void;
    removeNature: (id: string) => void;

    setSources: (sources: SourceType[]) => void;
    addSource: (source: SourceType) => void;
    removeSource: (id: string) => void;

    setUserActions: (userActions: UserActionType[]) => void;
    addUserAction: (userAction: UserActionType) => void;
    removeUserAction: (id: string) => void;

    setFiscalObjects: (data: FiscalObjectType[]) => void;
    addFiscalObjectType: (data: FiscalObjectType) => void;
    removeFiscalObjectType: (id: string) => void;
};

const useTransactionStore = createSelectors(
    create<TransactionStore>()((set, get) => ({
        categories: [],
        natures: [],
        sources: [],
        userActions: [],
        fiscalObjects: [],

        setCategories(categories) {
            set({ categories });
        },
        addCategory(category) {
            const exists = get().categories.some((p) => p.id === category.id);
            if (!exists) {
                set({ categories: [...get().categories, category] });
            }
        },
        removeCategory(id) {
            set({ categories: get().categories.filter((a) => a.id !== id) });
        },

        setNatures(natures) {
            set({ natures });
        },
        addNature(nature) {
            const exists = get().natures.some((p) => p.id === nature.id);
            if (!exists) {
                set({ natures: [...get().natures, nature] });
            }
        },
        removeNature(id) {
            set({ natures: get().natures.filter((a) => a.id !== id) });
        },

        setSources(sources) {
            set({ sources });
        },
        addSource(source) {
            const exists = get().sources.some((p) => p.id === source.id);
            if (!exists) {
                set({ sources: [...get().sources, source] });
            }
        },
        removeSource(id) {
            set({ sources: get().sources.filter((a) => a.id !== id) });
        },

        setUserActions(userActions) {
            set({ userActions: userActions });
        },
        addUserAction(userAction) {
            const exists = get().userActions.some((p) => p.id === userAction.id);
            if (!exists) {
                set({ userActions: [...get().userActions, userAction] });
            }
        },
        removeUserAction(id) {
            set({ userActions: get().userActions.filter((a) => a.id !== id) });
        },

        setFiscalObjects(data) {
            set({ fiscalObjects: data });
        },
        addFiscalObjectType(data) {
            const exists = get().fiscalObjects.some((p) => p.id === data.id);
            if (!exists) {
                set({ fiscalObjects: [...get().fiscalObjects, data] });
            }
        },
        removeFiscalObjectType(id) {
            set({ fiscalObjects: get().fiscalObjects.filter((a) => a.id !== id) });
        },
    }))
);

export default useTransactionStore;
