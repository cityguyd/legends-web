export type ConfidenceTier = "strong" | "inferred" | "refused";

const TIERS: Record<ConfidenceTier, { label: string; pill: string; dot: string }> = {
  strong: {
    label: "Strong",
    pill: "bg-confidence-doc-bg text-confidence-doc",
    dot: "bg-confidence-doc",
  },
  inferred: {
    label: "Inferred",
    pill: "bg-confidence-inf-bg text-confidence-inf",
    dot: "bg-confidence-inf",
  },
  refused: {
    label: "Refused",
    pill: "bg-confidence-spec-bg text-confidence-spec",
    dot: "bg-confidence-spec",
  },
};

/** Returns true when `tier` maps to a renderable confidence badge. */
export function isRenderableTier(tier: string): tier is ConfidenceTier {
  return tier in TIERS;
}

/** Capitalized Strong/Inferred/Refused label, or null for unknown tiers. */
export function confidenceLabel(tier: string): string | null {
  return TIERS[tier as ConfidenceTier]?.label ?? null;
}

export function ConfidenceBadge({ tier }: { tier: string }) {
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
