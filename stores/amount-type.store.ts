import { create } from "zustand";
import { createSelectors } from "@/lib/store";

type AmountType = "HT" | "TTC";

type AmountTypeStore = {
    amountType: AmountType;
    setAmountType: (amountType: AmountType) => void;
};

const useAmountTypeStore = createSelectors(
    create<AmountTypeStore>()((set, get) => ({
        amountType: "TTC",
        setAmountType(amountType) {
            set({ amountType });
        },
    }))
);

export default useAmountTypeStore;
