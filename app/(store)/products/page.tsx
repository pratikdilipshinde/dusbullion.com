"use client";
import { useMemo, useState } from "react";
import ProductFilters, {SortKey} from "@/app/components/ProductFilters";
import ProductGrid from "@/app/components/ProductGrid";
import { Product } from "@/app/lib/types";
import { useCart } from "@/app/store/cart";

const PRODUCTS: Product[] = [
  {
    id: "au-bar-10g",
    sku: "AU-BAR-10G-PAMP",
    name: "Gold Bar 10 g (PAMP)",
    metal: "GOLD",
    form: "BAR",
    weightGrams: 10,
    purity: "999.9",
    premiumUsd: 150,
    brand: "PAMP",
    country: "CH",
    image: "/products/featured-gold-bars.jpg",
    inStock: true,
  },
  {
    id: "au-bar-1oz",
    sku: "AU-BAR-1OZ-RCM",
    name: "Gold Bar 1 oz (RCM)",
    metal: "GOLD",
    form: "BAR",
    weightGrams: 31.1035,
    purity: "999.9",
    premiumUsd: 150,
    brand: "RCM",
    country: "CA",
    image: "/products/featured-gold-bars.jpg",
    inStock: true,
  },
  {
    id: "au-coin-maple-1oz",
    sku: "AU-COIN-MAPLE-1OZ",
    name: "Gold Maple Leaf 1 oz",
    metal: "GOLD",
    form: "COIN",
    weightGrams: 31.1035,
    purity: "999.9",
    premiumUsd: 150,
    brand: "RCM",
    country: "CA",
    image: "/products/featured-gold-bars.jpg",
    inStock: true,
  },
  {
    id: "au-coin-eagle-1oz",
    sku: "AU-COIN-EAGLE-1OZ",
    name: "American Gold Eagle 1 oz",
    metal: "GOLD",
    form: "COIN",
    weightGrams: 31.1035,
    purity: "916.7",
    premiumUsd: 150,
    brand: "US Mint",
    country: "US",
    image: "/products/featured-gold-bars.jpg",
    inStock: false,
  },
  {
    id: "au-bar-100g",
    sku: "AU-BAR-100G-PAMP",
    name: "Gold Bar 100 g (PAMP)",
    metal: "GOLD",
    form: "BAR",
    weightGrams: 100,
    purity: "999.9",
    premiumUsd: 150,
    brand: "PAMP",
    country: "CH",
    image: "/products/featured-gold-bars.jpg",
    inStock: true,
  },
];

export default function ProductsPage() {
  const add = useCart((s) => s.add);

  const [form, setForm] = useState<"ALL" | "BAR" | "COIN">("ALL");
  const [weight, setWeight] = useState<"ALL" | "10g" | "1oz" | "100g">("ALL");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("price-asc");

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (form !== "ALL" && p.form !== form) return false;

      if (weight !== "ALL") {
        if (weight === "10g" && Math.abs(p.weightGrams - 10) > 0.01) return false;
        if (weight === "1oz" && Math.abs(p.weightGrams - 31.1035) > 0.01) return false;
        if (weight === "100g" && Math.abs(p.weightGrams - 100) > 0.01) return false;
      }

      if (inStockOnly && !p.inStock) return false;
      return true;
    });
  }, [form, weight, inStockOnly]);

  // Sort by premium or estimated price (approx using $2,000/oz baseline to keep it static client-side)
  const sorted = useMemo(() => {
    // Static baseline used only for sorting consistency without waiting for live spot
    const baselineOz = 2000;
    const GRAMS_PER_OZ = 31.1034768;

    const withApprox = filtered.map((p) => {
      const oz = p.weightGrams / GRAMS_PER_OZ;
      const approxPrice = baselineOz * oz + p.premiumUsd;
      return { p, approxPrice };
    });

    withApprox.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.approxPrice - b.approxPrice;
        case "price-desc":
          return b.approxPrice - a.approxPrice;
        case "premium-asc":
          return a.p.premiumUsd - b.p.premiumUsd;
        case "premium-desc":
          return b.p.premiumUsd - a.p.premiumUsd;
        default:
          return 0;
      }
    });

    return withApprox.map((x) => x.p);
  }, [filtered, sort]);

  const reset = () => {
    setForm("ALL");
    setWeight("ALL");
    setInStockOnly(false);
    setSort("price-asc");
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-neutral-600">{sorted.length} items</p>
      </div>

      <ProductFilters
        form={form}
        setForm={setForm}
        weight={weight}
        setWeight={setWeight}
        inStockOnly={inStockOnly}
        setInStockOnly={setInStockOnly}
        sort={sort}
        setSort={setSort}
        reset={reset}
      />

      <ProductGrid
        products={sorted}
        onAdd={(p) => add(p, 1)}
      />
    </section>
  );
}
