import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { Decimal } from "decimal.js";

export type ItemQuantity = {
    id: string;
    quantity: number;
};

export type PurchaseItemType = {
    id: string;
    reference: string;
    hasTax: boolean;
    name: string;
    quantity: number;
    selectedQuantity: number;
    price: Decimal;
    updatedPrice: Decimal;
    lastSelectedQuantity?: number;
    itemType: "product" | "service";
    discountType: "purcent" | "money";
    discount: string;
    currency: string;
    description?: string;
    productServiceId?: string;
};

type ItemStore = {
    items: PurchaseItemType[];
    itemQuantity: ItemQuantity[];
    setItemQuantity: (items: ItemQuantity[]) => void;
    addItem: (item: PurchaseItemType) => void;
    removeItem: (id: string) => void;
    updateItem: (item: PurchaseItemType) => void;
    editItemField: (id: string, field: keyof PurchaseItemType, value: any) => void;
    setItems: (items: PurchaseItemType[]) => void;
    clearItem: () => void;
    updateDiscount: (discount: string) => void;
};

const usePurchaseItemStore = createSelectors(
    create<ItemStore>()((set, get) => ({
        items: [],
        itemQuantity: [],

        setItemQuantity(items) {
            set({ itemQuantity: items });
        },

        addItem(item) {
            set((state) => {
                if (item.id) {
                    const exists = state.items.some((i) => i.id === item.id);
                    if (exists) return state;
                }
                return { items: [...state.items, item] };
            });
        },

        removeItem(productServiceId) {
            set({
                items: get().items.filter(
                    (i) => i.productServiceId !== productServiceId
                ),
            });
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

export default usePurchaseItemStore;