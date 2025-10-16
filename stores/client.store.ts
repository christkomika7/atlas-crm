import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { ClientType } from "@/types/client.types";

type ClientStore = {
    client: ClientType | null;
    getClient: () => ClientType | null;
    setClient: (client: Partial<ClientType>) => void;
    updateClient: (updatedClient: Partial<ClientType>) => void;
    clearClient: () => void;
};

const useClientStore = createSelectors(create<ClientStore>()(
    (set, get) => ({
        client: null,
        setClient: (client) => set({ client: client as ClientType }),
        updateClient(updatedClient) {
            set((state) => ({
                client: {
                    ...state.client,
                    ...updatedClient as ClientType
                }
            }))
        },
        clearClient: () => set({ client: null }),
        getClient() {
            return get().client
        },
    }),
));

export default useClientStore;
