/**
 * Pure parsing helpers for marketing data rows coming out of Supabase.
 * These are extracted here so they can be unit-tested independently of the
 * Supabase client and Next.js cache machinery.
 *
 * NOTE: This file must NOT import from ./data to avoid a circular dependency.
 * Types are inlined here and kept in sync with the interfaces in data.ts.
 */

// ── Inlined types (kept in sync with data.ts interfaces) ────────────────────

export const LIVE_WAVE_DEFAULT = 1;

export interface ParsedCitation {
  title: string;
  url: string | null;
  year: number | null;
  snippet: string | null;
}

export interface ParsedResponse {
  figureId: string | null;
  figureName: string | null;
  answer: string;
  citations: ParsedCitation[];
  confidence: string;
}

export interface ParsedFeaturedQuestion {
  slug: string;
  question: string;
  format?: string;
  figure_slug?: string | null;
  figure_name?: string | null;
  subtitle?: string | null;
}

export interface ParsedFigure {
  slug: string;
  name: string;
  era: string | null;
  region: string | null;
  category: string[];
  wave: number;
  tagline: string | null;
  portrait_url: string | null;
  featured_order: number | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const EXCERPT_MAX = 300;

export function truncateExcerpt(text: string): string {
  return text.length <= EXCERPT_MAX ? text : `${text.slice(0, EXCERPT_MAX)}…`;
}

export function parseCitations(raw: unknown): ParsedCitation[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const c = entry as Record<string, unknown> | null;
    if (typeof c?.title !== "string") return [];
    return [
      {
        title: c.title,
        url: typeof c.url === "string" ? c.url : null,
        year: typeof c.year === "number" ? c.year : null,
        snippet:
          typeof c.snippet === "string" ? truncateExcerpt(c.snippet) : null,
      },
    ];
  });
}

/**
 * Parses the engine-generated `responses` jsonb (legends/featured.py):
 * a list of { figure_id, figure_name, answer, citations, confidence } where
 * citations are { title, url, year, snippet }. Guards every field — entries
 * without answer text are dropped.
 */
export function parseResponses(raw: unknown): ParsedResponse[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const r = entry as Record<string, unknown> | null;
    if (typeof r?.answer !== "string" || r.answer.length === 0) return [];
    return [
      {
        figureId: typeof r.figure_id === "string" ? r.figure_id : null,
        figureName: typeof r.figure_name === "string" ? r.figure_name : null,
        answer: r.answer,
        citations: parseCitations(r.citations),
        confidence:
          typeof r.confidence === "string" ? r.confidence : "inferred",
      },
    ];
  });
}

/** Runtime guard for a featured_questions row: require slug and question. */
export function parseFeaturedQuestionRow(
  row: unknown
): ParsedFeaturedQuestion | null {
  const r = row as Record<string, unknown> | null;
  if (typeof r?.slug !== "string" || typeof r?.question !== "string")
    return null;
  return {
    slug: r.slug,
    question: r.question,
    format: typeof r.format === "string" ? r.format : undefined,
    figure_slug: typeof r.figure_slug === "string" ? r.figure_slug : null,
    figure_name: typeof r.figure_name === "string" ? r.figure_name : null,
    subtitle: typeof r.subtitle === "string" ? r.subtitle : null,
  };
}

/** Runtime guard for a figures row: require slug and name, default the rest. */
export function parseFigureRow(row: unknown): ParsedFigure | null {
  const r = row as Record<string, unknown> | null;
  if (typeof r?.slug !== "string" || typeof r?.name !== "string") return null;
  return {
    slug: r.slug,
    name: r.name,
    era: typeof r.era === "string" ? r.era : null,
    region: typeof r.region === "string" ? r.region : null,
    category: Array.isArray(r.category)
      ? r.category.filter((c): c is string => typeof c === "string")
      : [],
    wave: typeof r.wave === "number" ? r.wave : LIVE_WAVE_DEFAULT,
    tagline: typeof r.tagline === "string" ? r.tagline : null,
    portrait_url: typeof r.portrait_url === "string" ? r.portrait_url : null,
    featured_order:
      typeof r.featured_order === "number" ? r.featured_order : null,
  };
}
