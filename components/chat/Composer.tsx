"use client";

import { useState } from "react";

export function Composer({
  onSend,
  disabled,
  remainingLabel,
  initialValue,
}: {
  onSend: (question: string) => void;
  /** True while a stream is in flight (consulting/typing). */
  disabled: boolean;
  /** e.g. "4 of 6 free questions left today" — null hides the counter. */
  remainingLabel: string | null;
  /** Prefill from ?q= — user still confirms by pressing Ask. */
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue ?? "");

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
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask your question…"
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
    </form>
  );
}
