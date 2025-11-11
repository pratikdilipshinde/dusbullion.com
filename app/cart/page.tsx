// app/cart/page.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../store/cart";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function CartPage() {
  const items   = useCart((s) => s.items);
  const setQty  = useCart((s) => s.setQty);
  const remove  = useCart((s) => s.remove);
  const clear   = useCart((s) => s.clear);
  const subtotalFn = useCart((s) => s.subtotal);

  const total = subtotalFn();
  const shipping = total > 500 ? 0 : 15;
  const grand = total + shipping;

  if (!items.length) {
    return (
      <section className="section py-12 ">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-neutral-600">Your cart is empty.</p>
          <Link href="/products" className="btn-secondary mt-4 inline-block">Browse Products</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Your Cart</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        {/* Items */}
        <div className="rounded-2xl border border-neutral-200 bg-white">
          <ul className="divide-y divide-neutral-200">
            {items.map((it) => (
              <li key={it.id} className="flex gap-4 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border">
                  <Image src={it.image} alt={it.name} fill className="object-contain" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{it.name}</p>
                      {it.meta?.brand && (
                        <p className="mt-0.5 text-xs text-neutral-500">{it.meta.brand}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold">{money(it.priceUsd)}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center rounded-lg border">
                      <button
                        className="px-3 py-1.5 text-sm"
                        onClick={() => setQty(it.id, it.qty - 1)}
                        aria-label="Decrease"
                      >−</button>
                      <input
                        className="w-12 border-x px-2 py-1.5 text-center text-sm"
                        value={it.qty}
                        onChange={(e) => {
                          const v = parseInt(e.target.value || "1", 10);
                          setQty(it.id, isNaN(v) ? 1 : v);
                        }}
                        inputMode="numeric"
                      />
                      <button
                        className="px-3 py-1.5 text-sm"
                        onClick={() => setQty(it.id, it.qty + 1)}
                        aria-label="Increase"
                      >+</button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-neutral-500">Line total</p>
                      <p className="text-sm font-semibold">
                        {money(it.priceUsd * it.qty)}
                      </p>
                    </div>
                  </div>

                  <button
                    className="mt-2 text-left text-xs text-red-600 hover:underline"
                    onClick={() => remove(it.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between p-4">
            <button onClick={clear} className="text-sm text-red-600 hover:underline">
              Clear cart
            </button>
            <Link href="/products" className="text-sm text-blue-700 hover:underline">
              Continue shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-max rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : money(shipping)}</span></div>
            <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{money(grand)}</span></div>
          </div>
          <button className="btn-secondary mt-4 w-full">Checkout (placeholder)</button>
          <p className="mt-2 text-xs text-neutral-500">You’ll enter address & payment on the next step.</p>
        </aside>
      </div>
    </section>
  );
}
