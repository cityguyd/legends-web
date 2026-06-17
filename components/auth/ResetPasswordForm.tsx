"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const supabase = createClient();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Password updated! Redirecting…");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <h1 className="font-display text-3xl text-ink font-bold text-center mb-2">
        New password
      </h1>
      <p className="text-center text-sm font-body text-sub mb-6">
        Choose a new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-xs font-body text-sub">
            New password
          </label>
          <input
            id="password"
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full py-2.5 px-3 bg-surface border border-border rounded-lg text-ink font-body text-sm placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirm" className="text-xs font-body text-sub">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {loading ? "Please wait…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
