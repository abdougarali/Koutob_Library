"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  setItems: (items: CartItem[]) => void;
  setHydrated: (hydrated: boolean) => void;
};

const STORAGE_KEY = "koutob-cart";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      addItem: (item, quantity = 1) => {
        const existing = get().items.find((existingItem) => existingItem.id === item.id);
        if (existing) {
          set({
            items: get().items.map((existingItem) =>
              existingItem.id === item.id
                ? {
                    ...existingItem,
                    quantity: existingItem.quantity + quantity,
                  }
                : existingItem,
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                ...item,
                quantity,
              },
            ],
          });
        }
      },
      removeItem: (id) =>
        set({
          items: get().items.filter((item) => item.id !== id),
        }),
      clearCart: () => set({ items: [] }),
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  quantity: Math.max(1, quantity),
                }
              : item,
          ),
        }),
      setItems: (items) => set({ items }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);




































