// app/api/spot/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";   // ALWAYS run fresh
export const revalidate = 0;              // No ISR cache
export const runtime = "edge";            // Fast

type SpotPayload = {
  usdPerOz: number;
  updatedAt: string;
  provider: string;
  error?: string;
};

export async function GET() {
  const provider = process.env.GOLD_API_PROVIDER || "metalsapi";
  const url = process.env.GOLD_API_URL;
  const key = process.env.GOLD_API_KEY;

  if (!url || !key) {
    return NextResponse.json(
      {
        error: "Missing GOLD_API_URL/GOLD_API_KEY",
        usdPerOz: 0,
        updatedAt: new Date().toISOString(),
        provider,
      } satisfies SpotPayload,
      { status: 200 }
    );
  }

  try {
    let usdPerOz = 0;
    let updatedAt = new Date().toISOString();

    if (provider === "goldapi") {
      const res = await fetch(url, {
        headers: {
          "x-access-token": key,
          "Content-Type": "application/json",
        },
        cache: "no-store", // 🚨 override Vercel caching
      });

      if (!res.ok) throw new Error(`Upstream ${res.status}`);
      const data = await res.json();

      usdPerOz = Number(data?.price);
      updatedAt = data?.timestamp
        ? new Date(data.timestamp * 1000).toISOString()
        : updatedAt;
    }

    else if (provider === "metalsapi") {
      const qs = new URLSearchParams({
        base: "XAU",
        symbols: "USD",
        access_key: key,
      });

      const res = await fetch(`${url}?${qs.toString()}`, {
        cache: "no-store", // 🚨 override Vercel caching
      });

      if (!res.ok) throw new Error(`Upstream ${res.status}`);

      const data = await res.json();

      usdPerOz = Number(data?.rates?.USD);
      updatedAt = data?.timestamp
        ? new Date(data.timestamp * 1000).toISOString()
        : updatedAt;
    }

    else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    if (!Number.isFinite(usdPerOz) || usdPerOz <= 0)
      throw new Error("Invalid price from provider");

    return NextResponse.json(
      { usdPerOz, updatedAt, provider } satisfies SpotPayload,
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        usdPerOz: 0,
        updatedAt: new Date().toISOString(),
        provider,
        error: err?.message || "Fetch failed",
      } satisfies SpotPayload,
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
