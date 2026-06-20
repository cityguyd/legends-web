"use client";

import { useCallback } from "react";
import { EvidenceRow, type EvidenceCitation } from "./EvidenceRow";
import { withAttribution, type CopyTier } from "@/lib/chat/copyAttribution";
import { confidenceLabel } from "./ConfidenceBadge";
import { RefusalCard } from "./RefusalCard";
import type { RefusalContext } from "@/lib/chat/chatReducer";

export type { CopyTier };

/** Default premium heading for a refusal when the caller supplies none. */
const DEFAULT_REFUSAL_HEADING = "Outside the Record";

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
  refusalContext?: RefusalContext;
  /** Set when the engine hit max_tokens — drives the Continue affordance. */
  truncated?: boolean;
}

export function ResponseCard({
  message,
  tier = "free",
  onCopied,
  refusalHeading = DEFAULT_REFUSAL_HEADING,
  onAskAdjacent,
  figureSlug,
  question,
  onContinue,
  continueDisabled,
  onRegenerate,
  regenerateDisabled,
}: {
  message: ResponseCardMessage;
  tier?: CopyTier;
  /** Called after the clipboard is written (for non-pro tiers). */
  onCopied?: () => void;
  /** Premium refusal heading — "Outside the Record" / "Beyond My Time". */
  refusalHeading?: string;
  /** Fires when the user clicks "Ask this" on a refusal's adjacent question. */
  onAskAdjacent?: (question: string) => void;
  /** Figure slug + originating question, for the "source we missed" form. */
  figureSlug?: string;
  question?: string;
  /** Called when the user wants to continue a truncated answer. */
  onContinue?: () => void;
  /** Disables the Continue button while a stream is in flight. */
  continueDisabled?: boolean;
  /** Called when the user wants to regenerate this answer. Only wired on the last figure message. */
  onRegenerate?: () => void;
  /** Disables the Regenerate button while a stream is in flight. */
  regenerateDisabled?: boolean;
}) {
  const isRefused = message.confidence === "refused";
  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLElement>) => {
      if (tier === "pro") return;
      const selected = window.getSelection()?.toString() ?? "";
      if (!selected) return;
      e.preventDefault();
      const primary = message.citations?.[0];
      e.clipboardData.setData(
        "text/plain",
        withAttribution(selected, tier, {
          figureName: message.figureName,
          citation: primary
            ? { title: primary.title ?? primary.doc_title, year: primary.year }
            : null,
        })
      );
      onCopied?.();
    },
    [tier, onCopied, message.figureName, message.citations]
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
        {!isRefused && message.confidence && confidenceLabel(message.confidence)
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
      {isRefused ? (
        <RefusalCard
          heading={refusalHeading}
          body={message.text}
          context={message.refusalContext}
          onAskAdjacent={onAskAdjacent}
          figureSlug={figureSlug}
          question={question}
        />
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">
            {message.text}
          </p>
          <EvidenceRow
            confidence={message.confidence}
            citations={message.citations}
          />
          {message.truncated && onContinue && (
            <button
              type="button"
              onClick={onContinue}
              disabled={continueDisabled}
              className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:bg-bubble disabled:opacity-50"
            >
              Continue
            </button>
          )}
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={regenerateDisabled}
              className="mt-3 ml-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-sub hover:bg-bubble disabled:opacity-50"
            >
              Regenerate
            </button>
          )}
        </>
      )}
    </article>
  );
}
