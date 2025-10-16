import { create } from "zustand";
import { createSelectors } from "@/lib/store";

type PdfStore = {
    pdf: string | null;
    setPdf: (pdf: string) => void;
    clear: () => void;
};

const usePdfStore = createSelectors(
    create<PdfStore>()((set) => ({
        pdf: null,
        setPdf(pdf) {
            set({ pdf });
        },

        clear() {
            set({ pdf: null });
        },
    }))
);

export default usePdfStore;
