import { create } from "zustand";
import { createSelectors } from "@/lib/store";
import { Decimal } from "decimal.js"


export type ItemQuantity = {
    id: string;
    quantity: number;
}

export type ItemType = {
    id: string;
    reference: string;
    name: string;
    description?: string;
    hasTax: boolean;
    quantity: number;
    maxQuantity?: number;
    locationStart: Date;
    locationEnd: Date;
    price: Decimal;
    updatedPrice: Decimal;
    billboardId?: string;
    billboardReference?: string;
    productServiceId?: string;
    discount: string;
    status?: "available" | "non-available"
    discountType: "purcent" | "money";
    currency: string;
    itemType: "billboard" | "product" | "service";
    lastQuantity?: number
};

export type LocationBillboardDateType = {
    id: string;
    isNew: true,
    invoiceId?: string;
    billboardReference?: string;
    locationDate: [Date, Date]
}

type ItemStore = {
    items: ItemType[];
    itemQuantity: ItemQuantity[];
    locationBillboardDate: LocationBillboardDateType[];
    setItemQuantity: (items: ItemQuantity[]) => void;
    addItem: (item: ItemType) => void;
    addLocationBillboard: (item: LocationBillboardDateType) => void;
    setLocationBillboard: (itemLocation: LocationBillboardDateType[]) => void;
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
        itemQuantity: [],


        setItemQuantity(items) {
            set({ itemQuantity: items })
        },

        setLocationBillboard(itemLocation) {
            set({ locationBillboardDate: itemLocation })
        },

        addLocationBillboard(item) {
            set((state) => {
                const exists = state.locationBillboardDate.some((i) => i.id === item.id);
                if (exists) return state;
                return { locationBillboardDate: [...state.locationBillboardDate, item] };
            });
        }
        ,
        addItem(item) {
            set((state) => {
                if (item.id) {
                    const exists = state.items.some((i) => i.id === item.id);
                    if (exists) return state;
                }

                return { items: [...state.items, item] };
            });
        },


        removeItem(id) {
            set({
                items: get().items.filter(
                    (i) => i.billboardId !== id && i.productServiceId !== id
                ),
            });
        },


        clearLocationBillboard() {
            set({ locationBillboardDate: [] })
        },

        removeLocationBillboard(id: string) {
            set({
                locationBillboardDate: get().locationBillboardDate.filter(
                    (item) =>
                        item.id !== id && item.id !== `random-id-${id.replace("random-id-", "")}`
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

export default useItemStore;
