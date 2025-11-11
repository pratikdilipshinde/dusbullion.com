"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;                 // product id
  name: string;
  image: string;
  priceUsd: number;           // unit price (live calc you pass in)
  qty: number;
  meta?: Record<string, any>; // weight, brand etc
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const i = s.items.findIndex((x) => x.id === item.id);
          if (i >= 0) {
            const next = [...s.items];
            next[i] = { ...next[i], qty: next[i].qty + qty, priceUsd: item.priceUsd };
            return { items: next };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x)),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((n, i) => n + i.priceUsd * i.qty, 0),
    }),
    { name: "dusb-cart" }
  )
);
