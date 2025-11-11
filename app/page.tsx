import Image from "next/image";
import Link from "next/link";


export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
            Transparent Pricing · Insured Shipping
          </span>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Invest with Confidence.
            <br /> Premium Gold Bars & Coins.
          </h1>
          <p className="text-lg text-neutral-600">
            Live spot‑linked prices with fair premiums. No hidden fees.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="rounded-2xl bg-black px-5 py-3 text-white hover:opacity-90">Shop Products</Link>
            <Link href="/why-us" className="rounded-2xl border border-neutral-300 px-5 py-3 hover:bg-white">Why dusbullion</Link>
          </div>
        </div>
        <div className="relative aspect-video rounded-3xl bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 p-1 overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-white/40" />
          <Image
            src="/gold-bullion-intro1.jpg"
            alt="Stacked pure gold bars representing Dusbullion gold investment products"
            fill
            className="rounded-2xl object-cover"
            priority
            quality={90}
          />
        </div>
      </section>
      {/* USPs */}
      <section id="why-us" className="mt-14 grid gap-4 md:grid-cols-3">
        {[
          { title: "Insured Shipping", desc: "Discreet, insured delivery with tracking." },
          { title: "Secure Payments", desc: "Cards, ACH, and wire options available." },
          { title: "Spot‑Linked Pricing", desc: "Transparent spot + premium at checkout." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{f.desc}</p>
          </div>
        ))}
      </section>
      {/* Featured Categories */}
      <section className="section mt-14 space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Featured</h2>
          <Link href="/products" className="text-sm link-underline">
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Gold Bars */}
          <div className="card">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
              <Image
                src="/featured-gold-bars.jpg"
                alt="Pure gold bars stacked in rows"
                fill
                className="object-contain transition-transform duration-500 hover:scale-105"
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Gold Bars</h3>
                <p className="text-sm text-neutral-600">10g • 1 oz • 100 g</p>
              </div>
              <Link
                href="/products"
                className="btn-primary text-sm px-4 py-2"
              >
                Shop
              </Link>
            </div>
          </div>

          {/* Gold Coins */}
          <div className="card">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
              <Image
                src="/featured-gold-coins.png"
                alt="Various gold coins including Maple and Eagle"
                fill
                className="object-contain transition-transform duration-500 hover:scale-105"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Gold Coins</h3>
                <p className="text-sm text-neutral-600">
                  Maple • Eagle • Krugerrand
                </p>
              </div>
              <Link
                href="/products"
                className="btn-primary text-sm px-4 py-2"
              >
                Shop
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ teaser */}
      <section id="faq" className="mt-14 rounded-3xl border border-neutral-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Frequently asked</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <p className="font-medium">How do you price gold?</p>
            <p className="text-sm text-neutral-600">We link to live spot price and add a transparent premium based on product.</p>
          </div>
          <div>
            <p className="font-medium">Is shipping insured?</p>
            <p className="text-sm text-neutral-600">Yes, all shipments are insured and tracked end‑to‑end.</p>
          </div>
          <div>
            <p className="font-medium">What payment methods?</p>
            <p className="text-sm text-neutral-600">Cards, ACH, and wire for larger orders.</p>
          </div>
        </div>
      </section>
    </>
  );
}