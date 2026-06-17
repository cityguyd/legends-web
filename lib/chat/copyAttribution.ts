const SITE = "legendslibrary.ai";
const PLAIN_ATTRIBUTION = `\n\n— via Legends Library, ${SITE}`;

export type CopyTier = "anonymous" | "free" | "pro";

export interface AttributionMeta {
  /** The figure the copied text is attributed to. */
  figureName?: string;
  /** The primary citation backing the copied text. */
  citation?: { title?: string | null; year?: number | null } | null;
}

/**
 * Appends a distinctive, linkable attribution to copied text (WS4-C). When we
 * know the figure (and ideally the source it's documented in), the suffix reads
 * like a real citation — e.g.
 *   "— Jesus of Nazareth, as documented in Matthew 5:9 (via Legends Library, legendslibrary.ai)"
 * so that wherever it's pasted, it's a backlink and an acquisition event. Pro
 * copies clean; without figure metadata it falls back to the plain credit line.
 */
export function withAttribution(
  text: string,
  tier: CopyTier,
  meta?: AttributionMeta
): string {
  if (tier === "pro") return text;
  if (!meta?.figureName) return text + PLAIN_ATTRIBUTION;

  const title = meta.citation?.title;
  const documented = title
    ? `, as documented in ${title}${
        meta.citation?.year ? ` (${meta.citation.year})` : ""
      }`
    : "";
  return `${text}\n\n— ${meta.figureName}${documented} (via Legends Library, ${SITE})`;
}
