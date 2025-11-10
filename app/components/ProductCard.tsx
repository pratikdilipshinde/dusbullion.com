"use client";
import Image from "next/image";
import { Product } from "../lib/types";
import { useQuery } from "@tanstack/react-query";

type SpotResponse =
  | { usdPerOz: number; updatedAt: string; provider: string } // your current API shape
  | { goldUsdPerOz: number; silverUsdPerOz: number; updatedAt: string; provider: string }; // future multi-metal

const GRAMS_PER_OZ = 31.1034768;
const formatUsd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void; }) {
  const { data } = useQuery<SpotResponse>({
    queryKey: ["spot-prices"],
    queryFn: async () => (await fetch("/api/spot", { cache: "no-store" })).json(),
    refetchInterval: 15000,
  });

  // Fallback logic:
  const goldOz =
    "goldUsdPerOz" in (data || {}) ? (data as any).goldUsdPerOz
    : "usdPerOz" in (data || {}) ? (data as any).usdPerOz
    : 0;

  const silverOz =
    "silverUsdPerOz" in (data || {}) ? (data as any).silverUsdPerOz : 0;

  const spotOz = product.metal === "GOLD" ? goldOz : silverOz;

  const oz = product.weightGrams / GRAMS_PER_OZ;
  const linePrice = spotOz > 0 ? spotOz * oz + product.premiumUsd : 0;

  return (
    <div className="card group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl flex items-center justify-center bg-neutral-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
        />
        {!product.inStock && (
          <span className="absolute right-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-medium text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-base font-medium">{product.name}</h3>
        <p className="text-sm text-neutral-600">
          {product.purity} • {product.weightGrams} g {product.form.toLowerCase()}
          {product.brand ? ` • ${product.brand}` : ""}
        </p>
        <div className="flex items-end justify-between">
          <p className="text-lg font-semibold">
            {linePrice > 0 ? formatUsd(linePrice) : "—"}
          </p>
          <p className="text-xs text-neutral-500">
            {spotOz > 0
              ? `${formatUsd(spotOz)}/oz + $${product.premiumUsd} prem.`
              : <span className="inline-block h-3 w-24 animate-pulse rounded bg-neutral-200" />}
          </p>
        </div>
      </div>

      <button
        disabled={!product.inStock}
        onClick={() => onAdd(product)}
        className={`mt-3 w-full ${product.inStock ? "btn-primary" : "btn-ghost text-neutral-400"}`}
      >
        {product.inStock ? "Add to Cart" : "Notify Me"}
      </button>
    </div>
  );
}
