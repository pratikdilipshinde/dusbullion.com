"use client";
import { useAuth } from "../lib/auth-context";
import { useUI } from "../store/ui";

export function MobileAuthActions({ close }: { close: () => void }) {
  const { user, loading, signOut } = useAuth();
  const { openAuth } = useUI();

  if (loading) {
    return <div className="h-10 w-full animate-pulse rounded-xl bg-neutral-200" />;
  }

  if (!user) {
    return (
      <div className="space-y-2 px-2">
        <button onClick={() => { close(); openAuth("login"); }} className="btn-ghost w-full">Login</button>
        <button onClick={() => { close(); openAuth("register"); }} className="btn-gold w-full">Register</button>
      </div>
    );
  }

  const name = user.displayName || user.email || "Account";
  return (
    <div className="space-y-2 px-2">
      <a href="/account" onClick={close} className="block rounded-xl border border-neutral-300 px-4 py-2 text-center font-medium hover:bg-neutral-100">
        {name}
      </a>
      <button
        className="btn-ghost w-full"
        onClick={async () => { await signOut(); close(); }}
      >
        Sign out
      </button>
    </div>
  );
}
