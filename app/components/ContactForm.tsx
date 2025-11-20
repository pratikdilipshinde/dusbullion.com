"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Your message has been sent successfully.");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.error || "Failed to send message.");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4"
    >
      <h3 className="text-lg font-semibold">Send Us a Message</h3>

      {error && (
        <div className="rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm"
        >
          {success}
        </div>
      )}

      <div>
        <label className="text-sm font-medium">Name *</label>
        <input
          type="text"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 mt-1 text-sm focus:border-black outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Email *</label>
        <input
          type="email"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 mt-1 text-sm focus:border-black outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Message *</label>
        <textarea
          className="w-full h-32 rounded-lg border border-neutral-300 px-3 py-2 mt-1 text-sm focus:border-black outline-none resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full mt-2 disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
