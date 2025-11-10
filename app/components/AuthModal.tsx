"use client";
import { useState } from "react";
import Modal from "./Modal";
import { useUI } from "../store/ui";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export default function AuthModal() {
  const { authOpen, initialTab, closeAuth } = useUI();
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail(""); setPassword(""); setName(""); setErr(""); setShow(false);
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      reset(); closeAuth();
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      reset(); closeAuth();
    } catch (e: any) {
      setErr(e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={authOpen} onClose={closeAuth} ariaLabel="Sign in or create account" widthClass="max-w-lg">
      {/* Tabs */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-neutral-100 p-1">
        <button
          onClick={() => setTab("login")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab==="login" ? "bg-white shadow" : "text-neutral-600"}`}
        >
          Login
        </button>
        <button
          onClick={() => setTab("register")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${tab==="register" ? "bg-white shadow" : "text-neutral-600"}`}
        >
          Register
        </button>
      </div>

      {/* Content */}
      {tab === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              placeholder="you@example.com"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <div className="flex items-center gap-2">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={()=>setShow(s=>!s)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-white"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={closeAuth}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Full name (optional)</label>
            <input
              value={name}
              onChange={(e)=>setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-300 px-3 py-2"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <div className="flex items-center gap-2">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={()=>setShow(s=>!s)}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-white"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={closeAuth}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
