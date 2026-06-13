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

// ── Data-driven upsell content ────────────────────────────────────────────────

interface UpsellContent {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

const UPSELL_CONTENT: Record<Exclude<LimitModalKind, "notify">, UpsellContent> =
  {
    "anon-daily": {
      heading: "You’ve used your 3 free questions today",
      body: "Create a free account and get 6 questions a day, plus save your conversations.",
      ctaLabel: "Sign Up Free",
      ctaHref: "/signup",
    },
    "free-daily": {
      heading: "You’ve reached today’s limit",
      body: "Upgrade to Premium for unlimited questions (fair use), clean copy, and PDF export.",
      ctaLabel: "Go Premium — $5/month",
      ctaHref: "/pricing",
    },
    "save-cap": {
      heading: "You’ve used all 5 saved conversations",
      body: "Free accounts get up to 5 slots. Upgrade to Premium for unlimited saves.",
      ctaLabel: "Go Premium",
      ctaHref: "/pricing",
    },
  };

// ── Inner content ─────────────────────────────────────────────────────────────

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
    onNotifySubmit?.(notifyEmail);
    setNotifyDone(true);
  }

  // Data-driven upsell path (anon-daily, free-daily, save-cap)
  if (kind !== "notify") {
    const { heading, body, ctaLabel, ctaHref } = UPSELL_CONTENT[kind];
    return (
      <>
        <h2
          id="limit-modal-heading"
          className="font-display text-2xl font-bold text-ink"
        >
          {heading}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-sub">{body}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={ctaHref}
            className="rounded-lg bg-gold px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            {ctaLabel}
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

  // Notify success state
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

  // Notify form
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

// ── LimitModal (native <dialog>) ──────────────────────────────────────────────

export function LimitModal({
  kind,
  open,
  onClose,
  onNotifySubmit,
}: LimitModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync open prop → showModal / close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      // jsdom guard: jsdom doesn't implement showModal
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    } else {
      // jsdom guard: jsdom doesn't implement close()
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
  }, [open]);

  // Native cancel event (Escape key in real browsers) → onClose
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault(); // prevent auto-close so we control it
      onClose();
    };
    const handleClose = () => {
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  // Backdrop click (click directly on the <dialog> element) → close
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="limit-modal-heading"
      onClick={handleDialogClick}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface shadow-xl open:flex open:flex-col"
    >
      <div className="p-8">
        {/* Close button */}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md border border-border bg-surface p-1 text-sub hover:text-ink"
        >
          ✕
        </button>

        {/* key=open remounts ModalContent on each open, resetting notify form state */}
        <ModalContent
          key={String(open)}
          kind={kind}
          onClose={onClose}
          onNotifySubmit={onNotifySubmit}
        />
      </div>
    </dialog>
  );
}
