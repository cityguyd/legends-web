"use client";

import { useCallback } from "react";
import { EvidenceRow, type EvidenceCitation } from "./EvidenceRow";
import { withAttribution, type CopyTier } from "@/lib/chat/copyAttribution";
import { confidenceLabel } from "./ConfidenceBadge";

export type { CopyTier };

/**
 * Message shape rendered by the card. Structurally compatible with the hook's
 * ChatMessage (lib/chat/chatReducer.ts) — extra fields like `role` are ignored.
 */
export interface ResponseCardMessage {
  figureName?: string;
  text: string;
  citations?: EvidenceCitation[];
  confidence?: string;
  contextChip?: string;
  sourceWarning?: string;
  tier3Warning?: string;
  tier3Sources?: string[];
}

export function ResponseCard({
  message,
  tier = "free",
  onCopied,
}: {
  message: ResponseCardMessage;
  tier?: CopyTier;
  /** Called after the clipboard is written (for non-pro tiers). */
  onCopied?: () => void;
}) {
  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLElement>) => {
      if (tier === "pro") return;
      const selected = window.getSelection()?.toString() ?? "";
      if (!selected) return;
      e.preventDefault();
      e.clipboardData.setData("text/plain", withAttribution(selected, tier));
      onCopied?.();
    },
    [tier, onCopied]
  );

  return (
    <article
      onCopy={handleCopy}
      className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm"
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {message.figureName && (
          <h3 className="font-display text-lg font-bold text-ink">
            {message.figureName}
          </h3>
        )}
        {message.contextChip && (
          <span className="rounded-full bg-bubble px-2.5 py-0.5 text-xs text-sub">
            {message.contextChip}
          </span>
        )}
      </header>
      <p className="mt-1 text-xs text-sub">
        AI reconstruction · Primary-source grounded
        {message.confidence && confidenceLabel(message.confidence)
          ? ` · Confidence: ${confidenceLabel(message.confidence)}`
          : ""}
      </p>

      <details className="mt-1 text-xs text-sub">
        <summary className="cursor-pointer hover:text-gold-dark">
          What does this mean?
        </summary>
        <p className="mt-1">
          {message.figureName
            ? `This is not a real statement by ${message.figureName}. `
            : "This is not a real statement by the figure. "}
          It is an AI-generated interpretation based on cited source material.
        </p>
      </details>
      {message.tier3Warning && (
        <div
          role="note"
          className="mt-3 flex items-start gap-2 rounded-lg border border-blue-300/60 bg-blue-50/80 px-3 py-2 text-xs text-blue-800 dark:border-blue-600/40 dark:bg-blue-900/20 dark:text-blue-200"
        >
          <span aria-hidden="true" className="mt-px shrink-0">ℹ</span>
          <div>
            <p className="font-medium">{message.tier3Warning}</p>
            {message.tier3Sources && message.tier3Sources.length > 0 && (
              <p className="mt-1 text-xs opacity-90">
                Sources cited: {message.tier3Sources.join("; ")}
              </p>
            )}
          </div>
        </div>
      )}
      {message.sourceWarning && (
        <div
          role="note"
          className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50/80 px-3 py-2 text-xs text-amber-800 dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-300"
        >
          <span aria-hidden="true" className="mt-px shrink-0">⚠</span>
          <span>{message.sourceWarning}</span>
        </div>
      )}
      <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">
        {message.text}
      </p>
      <EvidenceRow confidence={message.confidence} citations={message.citations} />
    </article>
  );
}
