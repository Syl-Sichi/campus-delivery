"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  vendorId: string;
  vendorName: string;
}

interface CartState {
  items: CartItem[];
  vendorId: string | null;
  vendorName: string | null;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      vendorId: null,
      vendorName: null,

      addItem: (item) => {
        const state = get();

        // Only allow items from one vendor at a time
        if (state.vendorId && state.vendorId !== item.vendorId) {
          // Clear cart and start fresh with new vendor
          set({
            items: [{ ...item, quantity: item.quantity || 1 }],
            vendorId: item.vendorId,
            vendorName: item.vendorName,
          });
          return;
        }

        const existing = state.items.find((i) => i.menuItemId === item.menuItemId);

        if (existing) {
          set({
            items: state.items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
            vendorId: item.vendorId,
            vendorName: item.vendorName,
          });
        } else {
          set({
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
            vendorId: item.vendorId,
            vendorName: item.vendorName,
          });
        }
      },

      removeItem: (menuItemId) => {
        const items = get().items.filter((i) => i.menuItemId !== menuItemId);
        set({
          items,
          vendorId: items.length ? get().vendorId : null,
          vendorName: items.length ? get().vendorName : null,
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], vendorId: null, vendorName: null }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "campus-delivery-cart",
    }
  )
);
