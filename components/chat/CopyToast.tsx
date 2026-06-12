"use client";

import { useEffect } from "react";

interface CopyToastProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Fixed bottom toast shown when non-pro users copy text from a response.
 * Auto-dismisses after 4 seconds.
 */
export function CopyToast({ visible, onDismiss }: CopyToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink shadow-lg"
    >
      Copied with attribution.{" "}
      <a
        href="/pricing"
        className="font-semibold text-gold-dark hover:underline"
      >
        Upgrade
      </a>{" "}
      for clean copy + PDF export.
    </div>
  );
}
