"use client";
import { useCart } from "../store/cart";

export default function AddToCartButton({
  product,
  priceUsd,
}: {
  product: { id: string; name: string; image: string; meta?: Record<string, any> };
  priceUsd: number;
}) {
  const add = useCart((s) => s.add);

  return (
    <button
      className="btn-secondary w-fill cursor-pointer"
      onClick={() =>
        add(
          {
            id: product.id,
            name: product.name,
            image: product.image,
            priceUsd,
            meta: product.meta,
          },
          1
        )
      }
    >
      Add to Cart
    </button>
  );
}
