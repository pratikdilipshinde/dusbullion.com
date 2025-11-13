// app/store/cart.ts
"use client";

import { create } from "zustand";
import type { Product } from "../lib/products";

export type CartItem = {
  id: string;
  name: string;
  image: string;
  priceUsd: number;   // unit price used for UI display only
  qty: number;
  meta?: {
    brand?: string;
    [key: string]: any;
  };
  premiumUsd?: number;   // ✅ for server-side recompute
  weightGrams?: number;  // ✅ for server-side recompute
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],

  add: (item, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, qty }] };
    }),

  setQty: (id, qty) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
        .filter((i) => i.qty > 0),
    })),

  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  clear: () => set({ items: [] }),

  subtotal: () => {
    const { items } = get();
    return items.reduce((sum, it) => sum + it.priceUsd * it.qty, 0);
  },

  count: () => {
    const { items } = get();
    return items.reduce((n, it) => n + it.qty, 0);
  },
}));
