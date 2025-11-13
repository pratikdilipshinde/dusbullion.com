// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { TROY_OUNCE_IN_GRAMS, usdToCents } from "@/app/lib/money";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Buyer = {
  email?: string;
  identityVerified?: boolean;
};

function computeShipping(subtotalUsd: number) {
  // Free insured shipping over $500, else flat $15
  return subtotalUsd > 500 ? 0 : 15;
}

export async function POST(req: Request) {
  try {
    const { items, buyer }: { items: any[]; buyer?: Buyer } = await req.json();

    // items expected shape (cart item):
    // {
    //   id: string;
    //   name: string;
    //   image: string;
    //   qty: number;
    //   meta?: { brand?: string; ... };
    //   premiumUsd?: number;   // per-unit premium
    //   weightGrams?: number;  // 31.1035 for 1oz, 10 for 10g, etc.
    // }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart empty" }, { status: 400 });
    }

    // Derive origin from the incoming request so it works in dev + prod
    const origin = new URL(req.url).origin;

    // 1) Fetch live spot price from your own /api/spot
    const spotRes = await fetch(`${origin}/api/spot`, { cache: "no-store" });

    if (!spotRes.ok) {
      console.error("Spot API failed with status:", spotRes.status);
      return NextResponse.json({ error: "Spot unavailable" }, { status: 503 });
    }

    const spotJson = await spotRes.json();
    console.log("Spot JSON:", spotJson);

    const usdPerOz = Number(spotJson?.usdPerOz || 0);
    if (!usdPerOz) {
      console.error("Invalid usdPerOz from spot:", spotJson);
      return NextResponse.json({ error: "Spot unavailable" }, { status: 503 });
    }

    // 2) Compute subtotal server-side (weight-aware)
    const subtotalUsd = items.reduce((sum: number, it: any) => {
      const grams = Number(it.weightGrams || TROY_OUNCE_IN_GRAMS);
      const spotPerUnit = usdPerOz * (grams / TROY_OUNCE_IN_GRAMS);
      const unitUsd = spotPerUnit + Number(it.premiumUsd || 0);
      const qty = Number(it.qty || 1);
      return sum + unitUsd * qty;
    }, 0);

    // 3) Optional ID verification gate for high-value orders
    const idThreshold = Number(process.env.CHECKOUT_ID_VERIFY_THRESHOLD_USD || 0);
    if (idThreshold && subtotalUsd >= idThreshold && !buyer?.identityVerified) {
      // Tell client to run Stripe Identity *before* creating Checkout session
      return NextResponse.json({ needIdentity: true, subtotalUsd }, { status: 200 });
    }

    // 4) Shipping
    const shippingUsd = computeShipping(subtotalUsd);

    // 5) Build Stripe line items with locked unit_amount
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (it: any) => {
        const grams = Number(it.weightGrams || TROY_OUNCE_IN_GRAMS);
        const spotPerUnit = usdPerOz * (grams / TROY_OUNCE_IN_GRAMS);
        const unitUsd = spotPerUnit + Number(it.premiumUsd || 0);

        return {
          quantity: Number(it.qty || 1),
          price_data: {
            currency: "usd",
            unit_amount: usdToCents(unitUsd),
            product_data: {
              name: it.name,
              images: it.image ? [it.image] : undefined,
              metadata: {
                product_id: it.id,
                brand: it.meta?.brand || "",
                weight_grams: String(grams),
              },
            },
          },
        };
      }
    );

    // 6) Payment methods: card always, ACH optional via env
    const enableAch = String(process.env.CHECKOUT_ENABLE_ACH || "false") === "true";
    const payment_method_types: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
      "card",
    ];
    if (enableAch) payment_method_types.push("us_bank_account");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types,
      payment_method_options: enableAch
        ? {
            us_bank_account: {
              financial_connections: { permissions: ["payment_method"] },
            },
          }
        : undefined,
      customer_email: buyer?.email,
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      shipping_options:
        shippingUsd === 0
          ? [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: "Insured Shipping (FREE)",
                  fixed_amount: { amount: 0, currency: "usd" },
                },
              },
            ]
          : [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: "Insured Shipping",
                  fixed_amount: { amount: usdToCents(shippingUsd), currency: "usd" },
                },
              },
            ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        spot_usd_per_oz: String(usdPerOz.toFixed(2)),
        subtotal_usd: String(subtotalUsd.toFixed(2)),
        shipping_usd: String(shippingUsd.toFixed(2)),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("checkout error", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
