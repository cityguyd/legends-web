"use client";

import { useEffect, useRef, useState } from "react";

export interface ComposerPrefill {
  /** Text to drop into the input. */
  value: string;
  /** Bump to re-apply the same text (e.g. clicking "Ask this" twice). */
  nonce: number;
}

export function Composer({
  onSend,
  disabled,
  remainingLabel,
  initialValue,
  prefill,
}: {
  onSend: (question: string) => void;
  /** True while a stream is in flight (consulting/typing). */
  disabled: boolean;
  /** e.g. "4 of 6 free questions left today" — null hides the counter. */
  remainingLabel: string | null;
  /** Prefill from ?q= — user still confirms by pressing Ask. */
  initialValue?: string;
  /** Imperative prefill (e.g. a refusal's "Ask this") — refills and focuses. */
  prefill?: ComposerPrefill | null;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Adjust state during render when the prefill nonce changes — the React-
  // sanctioned alternative to a setState-in-effect (and it re-applies the same
  // suggestion when "Ask this" is clicked twice, since the nonce still bumps).
  const [appliedNonce, setAppliedNonce] = useState<number | null>(
    prefill?.nonce ?? null
  );
  if (prefill && prefill.nonce !== appliedNonce) {
    setAppliedNonce(prefill.nonce);
    setValue(prefill.value);
  }

  // Focus is a genuine side effect (no state change) — safe in an effect.
  useEffect(() => {
    if (appliedNonce !== null) inputRef.current?.focus();
  }, [appliedNonce]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const question = value.trim();
    if (!question || disabled) return;
    onSend(question);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-surface px-4 py-3"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a bold question…"
          aria-label="Your question"
          aria-describedby={remainingLabel ? "composer-remaining" : undefined}
          className="min-w-0 flex-1 rounded-full border border-border bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-sub/70 focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
        <button
          type="submit"
          disabled={disabled || value.trim().length === 0}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ask
        </button>
      </div>
      {remainingLabel && (
        <p id="composer-remaining" className="mx-auto mt-2 max-w-3xl px-1 text-xs text-sub">
          {remainingLabel}
        </p>
      )}
      <p className="mx-auto mt-2 max-w-3xl px-1 text-xs text-sub/80">
        Answers are AI reconstructions grounded in primary sources.
      </p>
    </form>
  );
}
