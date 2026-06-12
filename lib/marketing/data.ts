import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import {
  parseFeaturedQuestionRow,
  parseFigureRow,
  parseResponses,
} from "./parsers";

// Re-export parsers so existing callers that import from data.ts keep working.
export {
  parseCitations,
  parseFeaturedQuestionRow,
  parseFigureRow,
  parseResponses,
  truncateExcerpt,
} from "./parsers";

export interface Figure {
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

export interface FeaturedQuestion {
  slug: string;
  question: string;
  format?: string;
  figure_slug?: string | null;
  figure_name?: string | null;
  subtitle?: string | null;
}

/** Figure row including its uuid (needed to join source_manifest / figure_ids). */
export interface FigureDetail extends Figure {
  id: string;
  /** Corpus gate (migration 003) — chat is closed until this flips true. */
  min_corpus_ok: boolean;
}

export type SourceLicense = "public_domain" | "licensed" | "copyrighted_fair_use";

export interface SourceDoc {
  id: string;
  doc_title: string;
  doc_type: string;
  year: number | null;
  license: SourceLicense;
}

export interface FeaturedCitation {
  title: string;
  url: string | null;
  year: number | null;
  snippet: string | null;
}

export interface FeaturedResponse {
  figureId: string | null;
  figureName: string | null;
  answer: string;
  citations: FeaturedCitation[];
  confidence: string;
}

export interface FeaturedQuestionDetail {
  slug: string;
  question: string;
  format: string;
  figureIds: string[];
  responses: FeaturedResponse[];
}

// Wave 1 = live/launched. Keep in sync with the DB update in 003_web_platform.sql.
export const LIVE_WAVE = 1;
export function isLive(figure: { wave: number }): boolean {
  return figure.wave === LIVE_WAVE;
}

/**
 * True for present-day figures (e.g. Charlie Kirk) — they have no "period
 * voice" to reconstruct, so the chat voice toggle is hidden.
 *
 * TODO: replace this heuristic with a real `contemporary` column on figures
 * when one lands in a migration.
 */
export function isContemporary(figure: {
  era: string | null;
  category: string[];
}): boolean {
  if (figure.era && /[-–—]\s*present$/i.test(figure.era.trim())) return true;
  return figure.category.some((c) => c.toLowerCase().includes("contemporary"));
}

/**
 * Anonymous, cookie-free Supabase client for public marketing data.
 * Cookie-based clients would opt ISR pages out of static rendering, and at
 * build time the env vars may be absent — return null and let callers
 * render an empty state.
 */
function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function parseFigureDetailRow(row: unknown): FigureDetail | null {
  const figure = parseFigureRow(row);
  const r = row as Record<string, unknown> | null;
  const id = r?.id;
  if (!figure || typeof id !== "string") return null;
  // Default false (closed) — the corpus gate must be explicitly opened.
  return { ...figure, id, min_corpus_ok: r?.min_corpus_ok === true };
}

async function _fetchFigures(): Promise<Figure[]> {
  const supabase = anonClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("figures")
      .select(
        "slug, name, era, region, category, wave, tagline, portrait_url, featured_order"
      )
      .order("wave", { ascending: true })
      .order("featured_order", { ascending: true, nullsFirst: false });
    if (error) {
      console.error("[getFigures] Supabase error:", error);
      return [];
    }
    return (data ?? []).flatMap((row) => {
      const figure = parseFigureRow(row);
      return figure ? [figure] : [];
    });
  } catch (err) {
    console.error("[getFigures] Unexpected error:", err);
    return [];
  }
}

// Cache the unfiltered figure list for 1 hour. The page is dynamic (reads
// searchParams for client-side filtering) so the route-level `revalidate`
// export is inert — caching happens here instead.
export const getFigures = unstable_cache(_fetchFigures, ["figures-list"], {
  revalidate: 3600,
});

async function _fetchFeaturedQuestions(): Promise<FeaturedQuestion[]> {
  const supabase = anonClient();
  if (!supabase) return [];
  try {
    // Explicit columns: only what the homepage consumes (from 001_init.sql +
    // 003_web_platform.sql — featured_questions has: slug, question, figure_ids,
    // responses, format, published, created_at).
    const { data, error } = await supabase
      .from("featured_questions")
      .select("slug, question, format, published, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) {
      console.error("[getFeaturedQuestions] Supabase error:", error);
      return [];
    }
    return (data ?? []).flatMap((row) => {
      const q = parseFeaturedQuestionRow(row);
      return q ? [q] : [];
    });
  } catch (err) {
    console.error("[getFeaturedQuestions] Unexpected error:", err);
    return [];
  }
}

export const getFeaturedQuestions = unstable_cache(
  _fetchFeaturedQuestions,
  ["featured-questions-list"],
  { revalidate: 3600 }
);

const FIGURE_DETAIL_COLUMNS =
  "id, slug, name, era, region, category, wave, tagline, portrait_url, featured_order, min_corpus_ok";

async function _fetchFigureBySlug(slug: string): Promise<FigureDetail | null> {
  const supabase = anonClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("figures")
      .select(FIGURE_DETAIL_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      console.error("[getFigureBySlug] Supabase error:", error);
      return null;
    }
    return parseFigureDetailRow(data);
  } catch (err) {
    console.error("[getFigureBySlug] Unexpected error:", err);
    return null;
  }
}

// Arguments are part of the unstable_cache key, so each slug caches separately.
export const getFigureBySlug = unstable_cache(
  _fetchFigureBySlug,
  ["figure-by-slug"],
  { revalidate: 3600 }
);

async function _fetchFiguresByIds(ids: string[]): Promise<FigureDetail[]> {
  if (ids.length === 0) return [];
  const supabase = anonClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("figures")
      .select(FIGURE_DETAIL_COLUMNS)
      .in("id", ids);
    if (error) {
      console.error("[getFiguresByIds] Supabase error:", error);
      return [];
    }
    return (data ?? []).flatMap((row) => {
      const figure = parseFigureDetailRow(row);
      return figure ? [figure] : [];
    });
  } catch (err) {
    console.error("[getFiguresByIds] Unexpected error:", err);
    return [];
  }
}

export const getFiguresByIds = unstable_cache(
  _fetchFiguresByIds,
  ["figures-by-ids"],
  { revalidate: 3600 }
);

const SOURCE_LICENSES: SourceLicense[] = [
  "public_domain",
  "licensed",
  "copyrighted_fair_use",
];

async function _fetchSourcesForFigure(figureId: string): Promise<SourceDoc[]> {
  const supabase = anonClient();
  if (!supabase) return [];
  try {
    // Only 'active' sources are public — pending/rejected/failed stay hidden.
    const { data, error } = await supabase
      .from("source_manifest")
      .select("id, doc_title, doc_type, year, license")
      .eq("figure_id", figureId)
      .eq("status", "active")
      .order("year", { ascending: true, nullsFirst: false });
    if (error) {
      console.error("[getSourcesForFigure] Supabase error:", error);
      return [];
    }
    return (data ?? []).flatMap((row) => {
      const r = row as Record<string, unknown>;
      if (typeof r?.doc_title !== "string" || typeof r?.doc_type !== "string") {
        return [];
      }
      return [
        {
          id: typeof r.id === "string" ? r.id : `${r.doc_title}-${r.year ?? "na"}`,
          doc_title: r.doc_title,
          doc_type: r.doc_type,
          year: typeof r.year === "number" ? r.year : null,
          // Unknown license values fall back to "licensed" (restrictive),
          // not "public_domain", to avoid over-permissive assumptions.
          license: SOURCE_LICENSES.includes(r.license as SourceLicense)
            ? (r.license as SourceLicense)
            : "licensed",
        } satisfies SourceDoc,
      ];
    });
  } catch (err) {
    console.error("[getSourcesForFigure] Unexpected error:", err);
    return [];
  }
}

export const getSourcesForFigure = unstable_cache(
  _fetchSourcesForFigure,
  ["sources-for-figure"],
  { revalidate: 3600 }
);

async function _fetchFeaturedQuestionsForFigure(
  figureId: string
): Promise<FeaturedQuestion[]> {
  const supabase = anonClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("featured_questions")
      .select("slug, question, format")
      .contains("figure_ids", [figureId])
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) {
      console.error("[getFeaturedQuestionsForFigure] Supabase error:", error);
      return [];
    }
    return (data ?? []).flatMap((row) => {
      const q = parseFeaturedQuestionRow(row);
      return q ? [q] : [];
    });
  } catch (err) {
    console.error("[getFeaturedQuestionsForFigure] Unexpected error:", err);
    return [];
  }
}

export const getFeaturedQuestionsForFigure = unstable_cache(
  _fetchFeaturedQuestionsForFigure,
  ["featured-questions-for-figure"],
  { revalidate: 3600 }
);

async function _fetchFeaturedQuestionBySlug(
  slug: string
): Promise<FeaturedQuestionDetail | null> {
  const supabase = anonClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("featured_questions")
      .select("slug, question, figure_ids, responses, format")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) {
      console.error("[getFeaturedQuestionBySlug] Supabase error:", error);
      return null;
    }
    const r = data as Record<string, unknown> | null;
    if (typeof r?.slug !== "string" || typeof r?.question !== "string") {
      return null;
    }
    return {
      slug: r.slug,
      question: r.question,
      format: typeof r.format === "string" ? r.format : "analysis",
      figureIds: Array.isArray(r.figure_ids)
        ? r.figure_ids.filter((id): id is string => typeof id === "string")
        : [],
      responses: parseResponses(r.responses),
    };
  } catch (err) {
    console.error("[getFeaturedQuestionBySlug] Unexpected error:", err);
    return null;
  }
}

export const getFeaturedQuestionBySlug = unstable_cache(
  _fetchFeaturedQuestionBySlug,
  ["featured-question-by-slug"],
  { revalidate: 3600 }
);
