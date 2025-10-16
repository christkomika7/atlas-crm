import { create } from "zustand";
import { createSelectors } from "@/lib/store";



type RecordIdStore = {
    recordId: string;
    setRecordId: (id: string) => void;
};

const useRecordIdStore = createSelectors(
    create<RecordIdStore>()((set) => ({
        recordId: "",
        setRecordId(id) {
            set({ recordId: id })
        },
    }))
);

export default useRecordIdStore;
