"use client";
import { Form } from "../lib/types";

export type SortKey = "price-asc" | "price-desc" | "premium-asc" | "premium-desc";

export default function ProductFilters({
  form,
  setForm,
  weight,
  setWeight,
  inStockOnly,
  setInStockOnly,
  sort,
  setSort,
  reset,
}: {
  form: Form | "ALL";
  setForm: (v: Form | "ALL") => void;
  weight: "ALL" | "10g" | "1oz" | "100g";
  setWeight: (v: "ALL" | "10g" | "1oz" | "100g") => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
  reset: () => void;
}) {
  return (
    <aside className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">Filters</h3>
        <button className="text-sm link-underline" onClick={reset}>Reset</button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Form</span>
          <select
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            value={form}
            onChange={(e) => setForm(e.target.value as any)}
          >
            <option value="ALL">All</option>
            <option value="BAR">Bars</option>
            <option value="COIN">Coins</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Weight</span>
          <select
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            value={weight}
            onChange={(e) => setWeight(e.target.value as any)}
          >
            <option value="ALL">All</option>
            <option value="10g">10 g</option>
            <option value="1oz">1 oz</option>
            <option value="100g">100 g</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="size-4 accent-black"
          />
          <span className="text-sm">In stock only</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-neutral-600">Sort</span>
          <select
            className="rounded-xl border border-neutral-300 px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="premium-asc">Premium ↑</option>
            <option value="premium-desc">Premium ↓</option>
          </select>
        </label>
      </div>
    </aside>
  );
}
