"use client";
import Image from "next/image";
import type { Product } from "../lib/products";
import AddToCartButton from "./AddToCartButton";

type PropsA = {
  product: Product;
  onAdd: (p: Product) => void;
  spotPerOz?: number;
};

type PropsB = {
  p: Product;
  spotPerOz: number;
  onAdd?: never;
};

type ProductCardProps = PropsA | PropsB;

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ProductCard(props: ProductCardProps) {
  const prod: Product = "p" in props ? props.p : props.product;
  const brand = prod.brand;
  const name = prod.name;

  // If we have spot price, show live price; otherwise omit it (parent-driven flow).
  const livePrice =
    typeof (props as any).spotPerOz === "number"
      ? Math.max(0, (props as any).spotPerOz) + (prod.premiumUsd || 0)
      : null;

  return (
    <div className="card space-y-2">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-white">
        <Image
          src={prod.image}
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
        {/* Action: either parent-provided onAdd OR internal add with computed price */}
        {"onAdd" in props && props.onAdd ? (
          <button
            className="btn-gold w-full sm:w-auto"
            onClick={() => props.onAdd(prod)}
          >
            Add to Cart
          </button>
        ) : livePrice != null ? (
          <AddToCartButton
            product={{ id: prod.id, name: prod.name, image: prod.image, meta: { brand: prod.brand, weight: "1 oz" } }}
            priceUsd={livePrice}
          />
        ) : (
          <button
            className="btn-ghost w-full sm:w-auto"
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
