import { create } from "zustand";
import { createSelectors } from "@/lib/store";



type ClientIdStore = {
    clientId: string;
    setClientId: (id: string) => void;
};

const useClientIdStore = createSelectors(
    create<ClientIdStore>()((set) => ({
        clientId: "",
        setClientId(id) {
            set({ clientId: id })
        },
    }))
);

export default useClientIdStore;
