import { create } from "zustand";
import { createSelectors } from "@/lib/store";

export type ItemType = {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    maxQuantity?: number;
    locationStart?: Date;
    locationEnd?: Date;
    lastDate?: Date;
    price: string;
    updatedPrice: string;
    discount: string;
    status?: "available" | "non-available"
    discountType: "purcent" | "money";
    currency: string;
    itemType: "billboard" | "product" | "service";
    lastQuantity?: number
};

type RangeDateType = {
    start: Date;
    end: Date;
}

export type LocationBillboardDateType = {
    id: string;
    locationDate: RangeDateType[]
}

type ItemStore = {
    items: ItemType[];
    locationBillboardDate: LocationBillboardDateType[];
    addItem: (item: ItemType) => void;
    addLocationBillboard: (item: LocationBillboardDateType) => void;
    clearLocationBillboard: () => void;
    removeItem: (id: string) => void;
    removeLocationBillboard: (id: string) => void;

    updateItem: (item: ItemType) => void;
    editItemField: (id: string, field: keyof ItemType, value: any) => void;
    setItems: (items: ItemType[]) => void;
    clearItem: () => void;
    updateDiscount: (discount: string) => void;
};

const useItemStore = createSelectors(
    create<ItemStore>()((set, get) => ({
        items: [],
        locationBillboardDate: [],

        addLocationBillboard(item) {
            set((state) => {
                const exists = state.locationBillboardDate.some((i) => i.id === item.id);
                if (exists) return state;
                return { locationBillboardDate: [...state.locationBillboardDate, item] };
            });
        },

        addItem(item) {
            set((state) => {
                const exists = state.items.some((i) => i.id === item.id);
                if (exists) return state; // Pas de doublons
                return { items: [...state.items, item] };
            });
        },

        removeItem(id) {
            set({ items: get().items.filter((i) => i.id !== id) });
        },

        clearLocationBillboard() {
            set({ locationBillboardDate: [] })
        },

        removeLocationBillboard(id) {
            set({ locationBillboardDate: get().locationBillboardDate.filter((i) => i.id !== id) });
        },

        updateItem(item) {
            set((state) => {
                const exists = state.items.some((i) => i.id === item.id);
                if (!exists) return state;
                return {
                    items: state.items.map((i) =>
                        i.id === item.id ? { ...i, ...item } : i
                    ),
                };
            });
        },

        editItemField(id, field, value) {
            set((state) => {
                const exists = state.items.some((i) => i.id === id);
                if (!exists) return state;
                return {
                    items: state.items.map((i) =>
                        i.id === id ? { ...i, [field]: value } : i
                    ),
                };
            });
        },

        setItems(items) {
            const uniqueItems = items.filter(
                (item, index, self) =>
                    index === self.findIndex((i) => i.id === item.id)
            );
            set({ items: uniqueItems });
        },

        clearItem() {
            set({ items: [] });
        },

        updateDiscount(discount) {
            set((state) => ({
                items: state.items.map((i) => ({
                    ...i,
                    discount,
                })),
            }));
        },
    }))
);

export default useItemStore;
