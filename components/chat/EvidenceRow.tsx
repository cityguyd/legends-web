"use client";

import { useState } from "react";
import { ConfidenceBadge, isRenderableTier } from "./ConfidenceBadge";

/**
 * Citation shape accepted by the evidence row. The engine/hook emits `title`
 * (lib/chat/chatReducer.ts), while engine-generated jsonb elsewhere uses
 * `doc_title` — accept both.
 */
export interface EvidenceCitation {
  title?: string;
  doc_title?: string;
  url?: string | null;
  year?: number | null;
  snippet?: string | null;
}

function citationLabel(citation: EvidenceCitation): string | null {
  const title = citation.doc_title ?? citation.title;
  if (!title) return null;
  return citation.year != null ? `${title}, ${citation.year}` : title;
}

export function EvidenceRow({
  confidence,
  citations,
}: {
  confidence?: string;
  citations?: EvidenceCitation[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const chips = (citations ?? []).flatMap((citation, index) => {
    const label = citationLabel(citation);
    return label ? [{ citation, label, index }] : [];
  });

  // Use isRenderableTier to avoid duplicating the tier list.
  const hasBadge = confidence !== undefined && isRenderableTier(confidence);

  if (!hasBadge && chips.length === 0) return null;

  const open = expanded !== null ? chips.find((c) => c.index === expanded) : undefined;
  const isLowConfidence = confidence === "refused";

  return (
    <div className="mt-3 border-t border-border pt-3">
      {(hasBadge || chips.length > 0) && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-dark">
          Receipts
        </p>
      )}
      {isLowConfidence && (
        <p className="mb-2 rounded-lg border-l-2 border-confidence-spec bg-confidence-spec-bg/40 px-3 py-2 text-xs text-sub">
          The source record is limited here, so this answer involves more
          interpretation than direct evidence.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {hasBadge && confidence && <ConfidenceBadge tier={confidence} />}
        {chips.map(({ citation, label, index }) => (
          <button
            key={index}
            type="button"
            aria-expanded={expanded === index}
            onClick={() => setExpanded((v) => (v === index ? null : index))}
            className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
              expanded === index
                ? "border-gold bg-gold/10 text-gold-dark"
                : "border-border bg-surface text-sub hover:border-gold/60 hover:text-gold-dark"
            }`}
          >
            {citation.snippet ? "❝ " : ""}
            {label}
          </button>
        ))}
      </div>
      {open?.citation.snippet && (
        <blockquote className="mt-2 rounded-lg border-l-2 border-gold bg-bubble/60 px-3 py-2 text-sm italic text-sub">
          {open.citation.snippet}
          {open.citation.url && (
            <a
              href={open.citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 not-italic text-xs font-semibold text-gold-dark hover:underline"
            >
              View source →
            </a>
          )}
        </blockquote>
      )}
    </div>
  );
}
