"use client";
import Link from "next/link";
import { useCart } from "../store/cart";

export default function CartIcon() {
  const count = useCart((s) => s.count());
  return (
    <Link
      href="/cart"
      className="relative rounded-xl border border-neutral-300 px-3 py-2 font-medium hover:bg-neutral-100"
      aria-label={`Cart${count ? `, ${count} items` : ""}`}
    >
      <span className="inline-flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6h14l-2 9H8L6 3H3" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="17" cy="20" r="1.5" />
        </svg>
        {/* <span className="hidden sm:inline">Cart</span> */}
      </span>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-[#c89f48] px-1.5 text-center text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
