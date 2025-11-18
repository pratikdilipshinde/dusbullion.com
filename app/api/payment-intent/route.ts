// app/api/payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { TROY_OUNCE_IN_GRAMS, usdToCents } from "@/app/lib/money";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type CartItem = {
  id: string;
  name: string;
  image?: string;
  qty: number;
  meta?: { brand?: string };
  premiumUsd?: number;
  weightGrams?: number;
};

type Buyer = {
  email?: string;
  name?: string;
  shipping?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string; // e.g. "US"
  };
};

function computeShipping(subtotalUsd: number) {
  return subtotalUsd > 500 ? 0 : 15;
}

export async function POST(req: Request) {
  try {
    const { items, buyer }: { items: CartItem[]; buyer?: Buyer } =
      await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart empty" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;

    // 1) Get live spot price
    const spotRes = await fetch(`${origin}/api/spot`, { cache: "no-store" });
    if (!spotRes.ok) {
      console.error("Spot API failed", spotRes.status);
      return NextResponse.json({ error: "Spot unavailable" }, { status: 503 });
    }
    const spotJson = await spotRes.json();
    const usdPerOz = Number(spotJson?.usdPerOz || 0);
    if (!usdPerOz) {
      console.error("Invalid usdPerOz", spotJson);
      return NextResponse.json({ error: "Spot unavailable" }, { status: 503 });
    }

    // 2) Server-side subtotal based on weight + premium
    const subtotalUsd = items.reduce((sum, it) => {
      const grams = Number(it.weightGrams || TROY_OUNCE_IN_GRAMS);
      const spotPerUnit = usdPerOz * (grams / TROY_OUNCE_IN_GRAMS);
      const unitUsd = spotPerUnit + Number(it.premiumUsd || 0);
      const qty = Number(it.qty || 1);
      return sum + unitUsd * qty;
    }, 0);

    const shippingUsd = computeShipping(subtotalUsd);
    const totalUsd = subtotalUsd + shippingUsd;

    // 3) Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: usdToCents(totalUsd),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: buyer?.email,
      shipping: buyer?.shipping
        ? {
            name: buyer.name || buyer.email || "Customer",
            address: buyer.shipping,
          }
        : undefined,
      metadata: {
        spot_usd_per_oz: usdPerOz.toFixed(2),
        subtotal_usd: subtotalUsd.toFixed(2),
        shipping_usd: shippingUsd.toFixed(2),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amountUsd: totalUsd,
    });
  } catch (err) {
    console.error("payment-intent error", err);
    return NextResponse.json(
      { error: "Failed to create PaymentIntent" },
      { status: 500 }
    );
  }
}
