// app/components/ProductCard.tsx
"use client";

import Image from "next/image";
import type { Product } from "../lib/products";
import { TROY_OUNCE_IN_GRAMS } from "../lib/money";
import AddToCartButton from "./AddToCartButton";

type ProductCardProps = {
  product: Product;
  spotPerOz?: number;
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ProductCard({ product, spotPerOz }: ProductCardProps) {
  const brand = product.brand;
  const name = product.name;
  const grams = product.weightGrams ?? TROY_OUNCE_IN_GRAMS;

  const livePrice =
    typeof spotPerOz === "number"
      ? Math.max(
          0,
          spotPerOz * (grams / TROY_OUNCE_IN_GRAMS) +
            (product.premiumUsd || 0)
        )
      : null;

  return (
    <div className="card space-y-2">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-white">
        <Image
          src={product.image}
          alt={name}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      <div className="space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold">{name}</h3>
        <p className="text-xs text-neutral-600">{brand}</p>
      </div>

      <div className="flex items-center justify-between">
        {livePrice != null ? (
          <div>
            <p className="text-xs text-neutral-500">Live Price</p>
            <p className="text-sm font-semibold">{money(livePrice)}</p>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">&nbsp;</span>
        )}
      </div>

      <div className="justify-self-center">
        {livePrice != null ? (
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              image: product.image,
              meta: {
                brand: product.brand,
              },
              // 🔥 used later by /api/checkout for server-side recompute
              premiumUsd: product.premiumUsd,
              weightGrams: product.weightGrams,
            }}
            priceUsd={livePrice}
          />
        ) : (
          <button
            className="btn-secondary w-full sm:w-auto cursor-pointer"
            disabled
            title="Price unavailable"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
