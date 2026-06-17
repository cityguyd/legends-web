"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  inviteToGroup,
  removeFromGroup,
  revokeInvite,
} from "@/lib/actions/group";
import type { GroupAdminView } from "@/lib/group/data";

const TIER_LABEL: Record<string, string> = {
  group: "Group",
  institution: "Institution",
};

export function GroupManager({ view }: { view: GroupAdminView }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    run(async () => {
      await inviteToGroup(value);
      setEmail("");
    });
  }

  const full = view.available <= 0;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-block rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {TIER_LABEL[view.tier] ?? view.tier}
            </span>
            <p className="mt-2 text-sm text-sub">
              <span className="font-display text-2xl font-bold text-ink">
                {view.used}
              </span>{" "}
              of {view.seatCount} seats used · {view.available} open
            </p>
          </div>
        </div>

        <form onSubmit={handleInvite} className="mt-5 flex flex-wrap gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            aria-label="Invite a member by email"
            disabled={pending || full}
            className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-sub/70 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={pending || full || !email.trim()}
            className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Invite
          </button>
        </form>
        {full && (
          <p className="mt-2 text-xs text-sub">
            All seats are in use. Remove a member or revoke an invite to free one.
          </p>
        )}
        {error && <p className="mt-2 text-sm text-confidence-spec">{error}</p>}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-bold text-ink">
          Members ({view.members.length})
        </h2>
        <ul className="mt-4 divide-y divide-border">
          {view.members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <span className="text-sm text-ink">
                {m.displayName ?? "Member"}
                {m.isAdmin && (
                  <span className="ml-2 rounded-full border border-gold/40 bg-card px-2 py-0.5 text-xs text-gold-dark">
                    Admin
                  </span>
                )}
              </span>
              {!m.isAdmin && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => removeFromGroup(m.id))}
                  className="text-xs font-semibold text-sub hover:text-confidence-spec disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {view.pendingInvites.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Pending invites ({view.pendingInvites.length})
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {view.pendingInvites.map((i) => (
              <li
                key={i.email}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <span className="text-sm text-sub">{i.email}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => revokeInvite(i.email))}
                  className="text-xs font-semibold text-sub hover:text-confidence-spec disabled:opacity-50"
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
