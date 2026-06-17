"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { provisionGroup } from "@/lib/actions/admin";

/**
 * Admin-only form for the "email to close" path: grant an existing account a
 * Group or Institution plan with a seat allowance (WS5).
 */
export function ProvisionGroupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("group");
  const [seats, setSeats] = useState("10");
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      try {
        await provisionGroup(email.trim(), tier, Number(seats));
        setResult({ ok: true, msg: `Provisioned ${tier} for ${email}.` });
        setEmail("");
        router.refresh();
      } catch (err) {
        setResult({
          ok: false,
          msg: err instanceof Error ? err.message : "Failed.",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col text-xs text-sub">
        Account email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@church.org"
          className="mt-1 w-64 rounded border border-border bg-bg px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col text-xs text-sub">
        Tier
        <select
          value={tier}
          onChange={(e) => {
            setTier(e.target.value);
            setSeats(e.target.value === "institution" ? "50" : "10");
          }}
          className="mt-1 rounded border border-border bg-bg px-2 py-1.5 text-sm text-ink"
        >
          <option value="group">Group</option>
          <option value="institution">Institution</option>
        </select>
      </label>
      <label className="flex flex-col text-xs text-sub">
        Seats
        <input
          type="number"
          min={1}
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          className="mt-1 w-20 rounded border border-border bg-bg px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <button
        type="submit"
        disabled={pending || !email.trim()}
        className="rounded bg-gold px-4 py-1.5 text-sm font-semibold text-white hover:bg-gold-dark disabled:opacity-50"
      >
        Provision
      </button>
      {result && (
        <span
          className={`text-sm ${result.ok ? "text-green-700" : "text-red-600"}`}
        >
          {result.msg}
        </span>
      )}
    </form>
  );
}
