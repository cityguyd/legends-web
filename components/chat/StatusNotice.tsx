"use client";

import type { ChatStatus } from "@/lib/chat/useChatStream";

/**
 * Maps non-happy-path chat statuses to inline notices.
 *
 * Handles error and blocked statuses only.
 * Limited status is handled exclusively by LimitModal — this component
 * intentionally renders nothing for it.
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
