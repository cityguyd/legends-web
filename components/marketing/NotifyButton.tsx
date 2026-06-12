"use client";

import { useState } from "react";
import { LimitModal } from "@/components/chat/LimitModal";

interface NotifyButtonProps {
  label?: string;
  className?: string;
}

/**
 * Client component for "Coming Soon" figures.
 * Renders a button that opens the notify modal; keeps FigureCard server-safe.
 */
export function NotifyButton({
  label = "Notify me",
  className,
}: NotifyButtonProps) {
  const [open, setOpen] = useState(false);

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
      <LimitModal kind="notify" open={open} onClose={() => setOpen(false)} />
    </>
  );
}
