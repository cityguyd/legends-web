"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    setError(null);
    setMessage(null);
    setLoading(true);
    const siteUrl =
      typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin)
        : process.env.NEXT_PUBLIC_SITE_URL ?? "";
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-callback`,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a reset link.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="font-display text-3xl text-ink font-bold text-center mb-2">
        Reset password
      </h1>
      <p className="text-center text-sm font-body text-sub mb-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs font-body text-sub">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-2.5 px-3 bg-surface border border-border rounded-lg text-ink font-body text-sm placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {message && (
          <p className="text-sm font-body text-confidence-inf bg-confidence-inf-bg px-3 py-2 rounded-lg">
            {message}
          </p>
        )}

        {error && (
          <p className="text-sm font-body text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gold text-surface font-body font-semibold text-sm rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Please wait…" : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs font-body text-sub">
        Remember your password?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
