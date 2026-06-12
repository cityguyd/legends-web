import { createClient } from "@supabase/supabase-js";

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

export async function getFigures(): Promise<Figure[]> {
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
    if (error) return [];
    return (data ?? []).map((row) => ({
      ...row,
      category: Array.isArray(row.category) ? row.category : [],
      wave: typeof row.wave === "number" ? row.wave : 1,
    }));
  } catch {
    return [];
  }
}

export async function getFeaturedQuestions(): Promise<FeaturedQuestion[]> {
  const supabase = anonClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("featured_questions")
      .select("*");
    if (error) return [];
    return (data ?? []).filter(
      (row): row is FeaturedQuestion =>
        typeof row?.slug === "string" && typeof row?.question === "string"
    );
  } catch {
    return [];
  }
}
