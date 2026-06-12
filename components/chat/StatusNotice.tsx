"use client";

import type { ChatStatus } from "@/lib/chat/useChatStream";

/**
 * Maps non-happy-path chat statuses to inline notices.
 *
 * Seam for Task 14: limit/blocked notices here will be replaced by the
 * upgrade/sign-up modals — swap the branches below for modal triggers
 * without touching ChatThread.
 */
export function StatusNotice({
  status,
  onRetry,
}: {
  status: ChatStatus;
  onRetry: () => void;
}) {
  if (status === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-sub"
      >
        Something went wrong.{" "}
        <button
          type="button"
          onClick={onRetry}
          className="font-semibold text-gold-dark hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (typeof status === "object" && status.kind === "limited") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-gold/40 bg-bubble px-4 py-3 text-sm text-ink"
      >
        {status.detail}
      </div>
    );
  }

  if (typeof status === "object" && status.kind === "blocked") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-sub"
      >
        {status.message}
      </div>
    );
  }

  return null;
}
