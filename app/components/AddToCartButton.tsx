// app/components/AddToCartButton.tsx
"use client";

import { useCart } from "../store/cart";

type ProductInput = {
  id: string;
  name: string;
  image: string;
  meta?: { brand?: string; [key: string]: any };
  premiumUsd?: number;
  weightGrams?: number;
};

type Props = {
  product: ProductInput;
  priceUsd: number;
};

export default function AddToCartButton({ product, priceUsd }: Props) {
  const items   = useCart((s) => s.items);
  const add     = useCart((s) => s.add);
  const setQty  = useCart((s) => s.setQty);
  const remove  = useCart((s) => s.remove);

  const existing = items.find((it) => it.id === product.id);
  const qty = existing?.qty ?? 0;

  // 🟢 If item NOT in cart yet → show "Add to Cart"
  if (!existing) {
    return (
      <button
        type="button"
        className="btn-secondary w-full sm:w-auto cursor-pointer"
        onClick={() =>
          add(
            {
              id: product.id,
              name: product.name,
              image: product.image,
              priceUsd,                 // used for UI subtotal
              meta: product.meta,
              premiumUsd: product.premiumUsd,   // 🔐 used by /api/checkout
              weightGrams: product.weightGrams, // 🔐 used by /api/checkout
            },
            1
          )
        }
      >
        Add to Cart
      </button>
    );
  }

  // 🔁 If item already in cart → show quantity controls
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex w-32 items-stretch overflow-hidden rounded-xl border border-neutral-300 divide-x divide-neutral-300">
        <button
          type="button"
          className="grid h-9 w-10 place-items-center text-base sm:h-8 sm:w-9 sm:text-sm"
          onClick={() => {
            if (qty <= 1) {
              remove(product.id);
            } else {
              setQty(product.id, qty - 1);
            }
          }}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <div className="grid h-9 flex-1 place-items-center text-sm sm:h-8">
          {qty}
        </div>
        <button
          type="button"
          className="grid h-9 w-10 place-items-center text-base sm:h-8 sm:w-9 sm:text-sm"
          onClick={() => setQty(product.id, qty + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}
