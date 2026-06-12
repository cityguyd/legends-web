"use client";

import { useState, useTransition } from "react";
import { deleteAccount } from "@/lib/actions/account";

/**
 * "Delete account" with an explicit confirm dialog before the irreversible
 * server action runs. On success deleteAccount redirects to "/".
 */
export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setFailed(false);
    startTransition(async () => {
      try {
        await deleteAccount();
      } catch {
        // NEXT_REDIRECT never reaches here (handled by Next); only real
        // failures do.
        setFailed(true);
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-lg border border-red-300 bg-surface px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        Delete account
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-labelledby="delete-account-heading"
      className="rounded-xl border border-red-300 bg-card p-4"
    >
      <p
        id="delete-account-heading"
        className="text-sm font-semibold text-ink"
      >
        Delete your account permanently?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-sub">
        This removes your profile and all saved conversations. It cannot be
        undone. Active subscriptions should be cancelled first via Manage
        Subscription.
      </p>
      {failed && (
        <p className="mt-2 text-xs font-medium text-red-600">
          Account deletion failed. Please try again.
        </p>
      )}
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={pending}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Yes, delete everything"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-sub transition-colors hover:bg-card"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
