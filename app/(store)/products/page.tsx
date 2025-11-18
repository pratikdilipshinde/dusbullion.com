// app/(store)/products/page.tsx
import PRODUCTS from "@/app/lib/products";
import ProductGrid from "@/app/components/ProductGrid"; // 👈 use the grid

async function getSpot() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const r = await fetch(`${baseUrl}/api/spot`, {
    cache: "no-store",
  }).catch(() => null);

  if (!r || !r.ok) return { usdPerOz: 0 };
  return r.json();
}

export const metadata = {
  title: "Products | dusbullion.com",
  description:
    "Buy 1oz gold bars from top global mints at live spot-linked prices.",
};

export default async function ProductsPage() {
  const spot = await getSpot();
  const spotPerOz = Number(spot?.usdPerOz || 0);

  return (
    <section className="section py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-neutral-600">
          Live spot:{" "}
          {spotPerOz
            ? spotPerOz.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              }) + " / oz"
            : "unavailable"}
        </p>
      </header>

      {/* 🔥 This handles layout + passes spot price down */}
      <ProductGrid products={PRODUCTS} spotPerOz={spotPerOz} />
    </section>
  );
}
