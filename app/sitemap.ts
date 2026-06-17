import type { MetadataRoute } from "next";
import { getFigures, getFeaturedQuestions } from "@/lib/marketing/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://legendslibrary.ai";

const now = new Date();

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
  { url: `${BASE}/figures`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  { url: `${BASE}/questions`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/sources`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/disclaimer`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [figures, questions] = await Promise.all([
    getFigures(),
    getFeaturedQuestions(),
  ]);

  const figureRoutes: MetadataRoute.Sitemap = figures
    .filter((f) => {
      // getFigures() returns Figure (no min_corpus_ok). Cast to access the field
      // if it's present, otherwise fall back to wave check only.
      const detail = f as { min_corpus_ok?: boolean; wave: number };
      return detail.min_corpus_ok === true || f.wave === 1;
    })
    .map((f) => ({
      url: `${BASE}/figures/${f.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const questionRoutes: MetadataRoute.Sitemap = questions.map((q) => ({
    url: `${BASE}/questions/${q.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...STATIC_ROUTES, ...figureRoutes, ...questionRoutes];
}
