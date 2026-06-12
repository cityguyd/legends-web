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
      // Runtime guard: require slug and name.
      if (typeof row?.slug !== "string" || typeof row?.name !== "string") {
        return [];
      }
      return [
        {
          slug: row.slug,
          name: row.name,
          era: typeof row.era === "string" ? row.era : null,
          region: typeof row.region === "string" ? row.region : null,
          category: Array.isArray(row.category) ? row.category : [],
          wave: typeof row.wave === "number" ? row.wave : LIVE_WAVE,
          tagline: typeof row.tagline === "string" ? row.tagline : null,
          portrait_url:
            typeof row.portrait_url === "string" ? row.portrait_url : null,
          featured_order:
            typeof row.featured_order === "number"
              ? row.featured_order
              : null,
          // TODO(data): add short_name column to figures table when ready.
        } satisfies Figure,
      ];
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
