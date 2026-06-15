"use client";

import { useState } from "react";
import { LimitModal } from "@/components/chat/LimitModal";
import { notifyMe } from "@/lib/actions/notify";

interface NotifyButtonProps {
  /** Slug of the Coming Soon figure this signup is for. */
  figureSlug: string;
  label?: string;
  className?: string;
}

/**
 * Client component for "Coming Soon" figures.
 * Renders a button that opens the notify modal; keeps FigureCard server-safe.
 * On submit it persists the email via the `notifyMe` server action.
 */
export function NotifyButton({
  figureSlug,
  label = "Notify me",
  className,
}: NotifyButtonProps) {
  const [open, setOpen] = useState(false);

  async function handleNotifySubmit(email: string) {
    try {
      await notifyMe(figureSlug, email);
    } catch (err) {
      // The modal optimistically shows success, so a rare failure (network/DB
      // blip) is logged rather than silently swallowed — never the old
      // behaviour of discarding the email with a fake confirmation.
      console.error("Notify signup failed", err);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-sub transition-colors hover:bg-surface"
        }
      >
        {label}
      </button>
      <LimitModal
        kind="notify"
        open={open}
        onClose={() => setOpen(false)}
        onNotifySubmit={handleNotifySubmit}
      />
    </>
  );
}
