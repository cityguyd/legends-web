"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export type LimitModalKind = "anon-daily" | "free-daily" | "save-cap" | "notify";

interface LimitModalProps {
  kind: LimitModalKind;
  open: boolean;
  onClose: () => void;
  /** Only used for kind="notify". Called with the submitted email. */
  onNotifySubmit?: (email: string) => void;
}

function ModalContent({
  kind,
  onClose,
  onNotifySubmit,
}: {
  kind: LimitModalKind;
  onClose: () => void;
  onNotifySubmit?: (email: string) => void;
}) {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyDone, setNotifyDone] = useState(false);

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire to a notify_signups server action when it exists
    onNotifySubmit?.(notifyEmail);
    setNotifyDone(true);
  }

  if (kind === "anon-daily") {
    return (
      <>
        <h2
          id="limit-modal-heading"
          className="font-display text-2xl font-bold text-ink"
        >
          You&apos;ve used your 3 free questions today
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          Create a free account and get 6 questions a day, plus save your
          conversations.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            Sign Up Free
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-sub transition-colors hover:bg-card"
          >
            Maybe later
          </button>
        </div>
      </>
    );
  }

  if (kind === "free-daily") {
    return (
      <>
        <h2
          id="limit-modal-heading"
          className="font-display text-2xl font-bold text-ink"
        >
          You&apos;ve reached today&apos;s limit
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          Upgrade to Premium for unlimited questions (fair use), clean copy, and
          PDF export.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/pricing"
            className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            Go Premium — $7/month
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-sub transition-colors hover:bg-card"
          >
            Maybe later
          </button>
        </div>
      </>
    );
  }

  if (kind === "save-cap") {
    return (
      <>
        <h2
          id="limit-modal-heading"
          className="font-display text-2xl font-bold text-ink"
        >
          You&apos;ve used all 5 saved conversations
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          Free accounts get up to 5 slots. Upgrade to Premium for unlimited
          saves.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/pricing"
            className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            Go Premium
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-sub transition-colors hover:bg-card"
          >
            Maybe later
          </button>
        </div>
      </>
    );
  }

  // kind === "notify"
  if (notifyDone) {
    return (
      <>
        <h2
          id="limit-modal-heading"
          className="font-display text-2xl font-bold text-ink"
        >
          We&apos;ll let you know
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          You&apos;re on the list. We&apos;ll email you when this figure arrives.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
        >
          Done
        </button>
      </>
    );
  }

  return (
    <>
      <h2
        id="limit-modal-heading"
        className="font-display text-2xl font-bold text-ink"
      >
        We&apos;ll let you know
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-sub">
        Enter your email and we&apos;ll notify you when this figure is available.
      </p>
      <form onSubmit={handleNotify} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-ink placeholder:text-sub focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
        <button
          type="submit"
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
        >
          Notify Me
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-sub transition-colors hover:bg-card"
        >
          Maybe later
        </button>
      </form>
    </>
  );
}

export function LimitModal({
  kind,
  open,
  onClose,
  onNotifySubmit,
}: LimitModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasOpenedRef = useRef(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save & restore focus; guard against stealing focus on initial mount.
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      hasOpenedRef.current = true;
      // Focus the close button after paint.
      requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else if (hasOpenedRef.current) {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  // Escape closes the modal.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />

      {/* Dialog card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="limit-modal-heading"
        className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md border border-border bg-surface p-1 text-sub hover:text-ink"
        >
          ✕
        </button>

        <ModalContent
          kind={kind}
          onClose={onClose}
          onNotifySubmit={onNotifySubmit}
        />
      </div>
    </div>
  );
}
