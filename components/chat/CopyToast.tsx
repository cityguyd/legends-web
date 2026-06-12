"use client";

import { useEffect, useRef } from "react";

interface CopyToastProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Fixed bottom toast shown when non-pro users copy text from a response.
 * Auto-dismisses after 4 seconds.
 *
 * The container is always mounted so the role="status" live region is present
 * and screen-reader announcements work correctly.
 */
export function CopyToast({ visible, onDismiss }: CopyToastProps) {
  // Hold the latest onDismiss in a ref so the effect depends only on `visible`
  // and re-renders with a new onDismiss callback don't reset the 4s timer.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => onDismissRef.current(), 4000);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink shadow-lg transition-opacity",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >
      {visible && (
        <>
          Copied with attribution.{" "}
          <a
            href="/pricing"
            className="font-semibold text-gold-dark hover:underline"
          >
            Upgrade
          </a>{" "}
          for clean copy + PDF export.
        </>
      )}
    </div>
  );
}
