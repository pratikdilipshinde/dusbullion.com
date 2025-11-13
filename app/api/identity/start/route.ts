// app/api/identity/start/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { return_url, user_email } = await req.json();

    const verification = await stripe.identity.verificationSessions.create({
      type: "document",
      options: {
        document: { require_matching_selfie: true },
      },
      metadata: {
        user_email: user_email || "",
      },
      return_url: return_url || "http://localhost:3000/cart",
    });

    return NextResponse.json({ url: verification.url });
  } catch (e) {
    console.error("identity start error", e);
    return NextResponse.json(
      { error: "Failed to start identity verification" },
      { status: 500 }
    );
  }
}
