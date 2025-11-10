// store/cart.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "../lib/types";

// ---- Types ----
export type CartItem = {
  product: Product;
  qty: number;
};

type CartState = {
  items: CartItem[];

  // actions
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  increment: (productId: string, step?: number) => void;
  decrement: (productId: string, step?: number) => void;
  clear: () => void;

  // selectors
  count: () => number;      // total units
  lines: () => number;      // total distinct products
  subtotal: (spotGoldUsdPerOz?: number, spotSilverUsdPerOz?: number) => number;
};

// ---- Helpers ----
const GRAMS_PER_OZ = 31.1034768;

function linePriceUSD(item: CartItem, goldOz?: number, silverOz?: number): number {
  const oz = item.product.weightGrams / GRAMS_PER_OZ;
  const spot =
    item.product.metal === "GOLD" ? (goldOz ?? 0) : (silverOz ?? 0);
  // If live spot is missing, treat spot as 0 -> shows 0 until fetched on UI
  // You can change to a cached baseline if you prefer.
  return (spot > 0 ? spot * oz + item.product.premiumUsd : 0) * item.qty;
}

// ---- Store ----
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product, qty = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.product.id === product.id);
          if (idx >= 0) {
            const next = [...state.items];
            next[idx] = { ...next[idx], qty: next[idx].qty + qty };
            return { items: next };
          }
          return { items: [...state.items, { product, qty }] };
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      setQty: (productId, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.product.id !== productId) };
          }
          const next = state.items.map((i) =>
            i.product.id === productId ? { ...i, qty } : i
          );
          return { items: next };
        }),

      increment: (productId, step = 1) =>
        set((state) => {
          const next = state.items.map((i) =>
            i.product.id === productId ? { ...i, qty: i.qty + step } : i
          );
          return { items: next };
        }),

      decrement: (productId, step = 1) =>
        set((state) => {
          const next = state.items
            .map((i) =>
              i.product.id === productId ? { ...i, qty: i.qty - step } : i
            )
            .filter((i) => i.qty > 0);
          return { items: next };
        }),

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      lines: () => get().items.length,

      // subtotal is computed with passed-in spot prices (so UI can use live prices)
      subtotal: (spotGoldUsdPerOz, spotSilverUsdPerOz) =>
        get().items.reduce(
          (sum, item) => sum + linePriceUSD(item, spotGoldUsdPerOz, spotSilverUsdPerOz),
          0
        ),
    }),
    {
      name: "gold-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // You can migrate versions here if you later change shape
      // migrate: async (persistedState, version) => persistedState as any,
      partialize: (state) => ({ items: state.items }), // persist items only
    }
  )
);
