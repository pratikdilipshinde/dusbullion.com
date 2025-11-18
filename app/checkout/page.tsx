// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "../store/cart";
import { useAuth } from "../lib/auth-context";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

type BuyerForm = {
  name: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

function CheckoutInner({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const clear   = useCart((s) => s.clear);
  const subtotalFn = useCart((s) => s.subtotal);

  const [buyer, setBuyer] = useState<BuyerForm>({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    country: "US",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtotal = subtotalFn();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!stripe || !elements) return;

    setSubmitting(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: buyer.email || undefined,
        shipping: {
          name: buyer.name || buyer.email || "Customer",
          address: {
            line1: buyer.line1,
            line2: buyer.line2 || undefined,
            city: buyer.city,
            state: buyer.state || undefined,
            postal_code: buyer.postal,
            country: buyer.country,
          },
        },
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      setErrorMsg(error.message || "Payment failed");
      setSubmitting(false);
      return;
    }

    // For some flows (no redirect), you may get here.
    clear();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="section mx-auto flex max-w-3xl flex-col gap-6 py-8"
    >
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <div className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 md:grid-cols-2">
        {/* Contact & Shipping */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Contact & Shipping</h2>

          <input
            className="input"
            placeholder="Full name"
            value={buyer.name}
            onChange={(e) => setBuyer((b) => ({ ...b, name: e.target.value }))}
            required
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={buyer.email}
            onChange={(e) => setBuyer((b) => ({ ...b, email: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Address line 1"
            value={buyer.line1}
            onChange={(e) => setBuyer((b) => ({ ...b, line1: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Address line 2 (optional)"
            value={buyer.line2}
            onChange={(e) => setBuyer((b) => ({ ...b, line2: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              placeholder="City"
              value={buyer.city}
              onChange={(e) => setBuyer((b) => ({ ...b, city: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="State / Region"
              value={buyer.state}
              onChange={(e) => setBuyer((b) => ({ ...b, state: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input"
              placeholder="Postal code"
              value={buyer.postal}
              onChange={(e) => setBuyer((b) => ({ ...b, postal: e.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Country (US, CA, etc.)"
              value={buyer.country}
              onChange={(e) =>
                setBuyer((b) => ({ ...b, country: e.target.value.toUpperCase() }))
              }
              required
            />
          </div>
        </div>

        {/* Stripe Element */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Payment</h2>
          <PaymentElement />
          <p className="text-xs text-neutral-500">
            Card details and wallets (Apple Pay, Google Pay, etc.) are securely
            processed by Stripe. We never see your full card number.
          </p>
        </div>
      </div>

      {/* Summary + Pay button */}
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex justify-between text-sm">
          <span>Estimated subtotal (before live recompute)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button
          type="submit"
          disabled={submitting || !clientSecret || !stripe || !elements}
          className="btn-gold mt-2 self-end"
        >
          {submitting ? "Processing…" : "Pay securely"}
        </button>
        {errorMsg && (
          <p className="text-sm text-red-600">
            {errorMsg}
          </p>
        )}
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!items.length) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            buyer: { email: user?.email },
          }),
        });

        const text = await res.text();

        if (!res.ok) {
          console.error("Payment-intent error:", text);
          alert("Failed to start checkout.");
          setLoading(false);
          return;
        }

        const json = JSON.parse(text);
        if (json.clientSecret) {
          setClientSecret(json.clientSecret);
        } else {
          console.error("No clientSecret:", json);
          alert("Missing clientSecret from server.");
        }
      } catch (err) {
        console.error("Checkout fetch error:", err);
        alert("Network error, see console.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [items, user?.email]);

  if (!items.length) {
    return (
      <section className="section py-10">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-4 text-neutral-600">Your cart is empty.</p>
      </section>
    );
  }

  if (loading || !clientSecret) {
    return (
      <section className="section py-10">
        <p>Preparing secure checkout…</p>
      </section>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret, appearance: { theme: "stripe" } }}
    >
      <CheckoutInner clientSecret={clientSecret} />
    </Elements>
  );
}
