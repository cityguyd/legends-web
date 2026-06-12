"use client";

import { useCallback } from "react";
import { EvidenceRow, type EvidenceCitation } from "./EvidenceRow";
import { withAttribution, type CopyTier } from "@/lib/chat/copyAttribution";

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
      <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">
        {message.text}
      </p>
      <EvidenceRow confidence={message.confidence} citations={message.citations} />
    </article>
  );
}
