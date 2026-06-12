export type ConfidenceTier = "strong" | "inferred" | "speculative";

const TIERS: Record<ConfidenceTier, { label: string; pill: string; dot: string }> = {
  strong: {
    label: "Documented",
    pill: "bg-confidence-doc-bg text-confidence-doc",
    dot: "bg-confidence-doc",
  },
  inferred: {
    label: "Inferred",
    pill: "bg-confidence-inf-bg text-confidence-inf",
    dot: "bg-confidence-inf",
  },
  speculative: {
    label: "Speculative",
    pill: "bg-confidence-spec-bg text-confidence-spec",
    dot: "bg-confidence-spec",
  },
};

export function ConfidenceBadge({ tier }: { tier: string }) {
  // Tier values come from engine-generated jsonb at runtime; render nothing
  // for values we don't recognize (e.g. "refused").
  const t = TIERS[tier as ConfidenceTier];
  if (!t) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${t.pill}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${t.dot}`} />
      {t.label}
    </span>
  );
}
