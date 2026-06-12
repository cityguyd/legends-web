import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

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
  figure_slug?: string | null;
  figure_name?: string | null;
  subtitle?: string | null;
}

/** Figure row including its uuid (needed to join source_manifest / figure_ids). */
export interface FigureDetail extends Figure {
  id: string;
}

export type SourceLicense = "public_domain" | "licensed" | "copyrighted_fair_use";

export interface SourceDoc {
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

/** Runtime guard for a figures row: require slug and name, default the rest. */
function parseFigureRow(row: unknown): Figure | null {
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
    wave: typeof r.wave === "number" ? r.wave : LIVE_WAVE,
    tagline: typeof r.tagline === "string" ? r.tagline : null,
    portrait_url: typeof r.portrait_url === "string" ? r.portrait_url : null,
    featured_order: typeof r.featured_order === "number" ? r.featured_order : null,
    // TODO(data): add short_name column to figures table when ready.
  } satisfies Figure;
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
    return (data ?? [])
      .filter(
        (row) =>
          typeof (row as Record<string, unknown>)?.slug === "string" &&
          typeof (row as Record<string, unknown>)?.question === "string"
      )
      .map((row) => row as unknown as FeaturedQuestion);
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
  "id, slug, name, era, region, category, wave, tagline, portrait_url, featured_order";

function parseFigureDetailRow(row: unknown): FigureDetail | null {
  const figure = parseFigureRow(row);
  const id = (row as Record<string, unknown> | null)?.id;
  if (!figure || typeof id !== "string") return null;
  return { ...figure, id };
}

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
      .select("doc_title, doc_type, year, license")
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
          doc_title: r.doc_title,
          doc_type: r.doc_type,
          year: typeof r.year === "number" ? r.year : null,
          license: SOURCE_LICENSES.includes(r.license as SourceLicense)
            ? (r.license as SourceLicense)
            : "public_domain",
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
    return (data ?? [])
      .filter(
        (row) =>
          typeof (row as Record<string, unknown>)?.slug === "string" &&
          typeof (row as Record<string, unknown>)?.question === "string"
      )
      .map((row) => row as unknown as FeaturedQuestion);
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

const EXCERPT_MAX = 300;

function truncateExcerpt(text: string): string {
  return text.length <= EXCERPT_MAX ? text : `${text.slice(0, EXCERPT_MAX)}…`;
}

function parseCitations(raw: unknown): FeaturedCitation[] {
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
      } satisfies FeaturedCitation,
    ];
  });
}

/**
 * Parses the engine-generated `responses` jsonb (legends/featured.py):
 * a list of { figure_id, figure_name, answer, citations, confidence } where
 * citations are { title, url, year, snippet }. Guards every field — entries
 * without answer text are dropped.
 */
function parseResponses(raw: unknown): FeaturedResponse[] {
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
        confidence: typeof r.confidence === "string" ? r.confidence : "inferred",
      } satisfies FeaturedResponse,
    ];
  });
}

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
