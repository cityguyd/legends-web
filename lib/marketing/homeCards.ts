// Curated homepage seed data (V2). Featured cards are chat CTAs; trending are
// the same. `live` controls whether the CTA deep-links into chat (prefilled
// question) or routes to the figure profile's "Notify Me". Update `live` when a
// figure is promoted to wave 1.

export interface FeaturedCard {
  question: string;
  figureSlug: string;
  figureShort: string;
  meta: string; // e.g. "Civil Rights · Race · Medium-confidence inference"
  live: boolean;
}

export interface TrendingQuestion {
  question: string;
  figureSlug: string;
  live: boolean;
}

export const FEATURED_CARDS: FeaturedCard[] = [
  {
    question: "What would MLK think of Black America today?",
    figureSlug: "martin-luther-king",
    figureShort: "MLK",
    meta: "Civil Rights · Race · Source-grounded inference",
    live: true,
  },
  {
    question: "Would Lincoln recognize today's divided America?",
    figureSlug: "abraham-lincoln",
    figureShort: "Lincoln",
    meta: "Union · Democracy · Coming soon",
    live: false,
  },
  {
    question: "Is America still failing its founding promise?",
    figureSlug: "frederick-douglass",
    figureShort: "Douglass",
    meta: "Liberty · Equality · Coming soon",
    live: false,
  },
  {
    question: "What would Marcus Aurelius say about anxiety?",
    figureSlug: "marcus-aurelius",
    figureShort: "Marcus",
    meta: "Stoicism · Self-control · Coming soon",
    live: false,
  },
];

export const TRENDING_QUESTIONS: TrendingQuestion[] = [
  { question: "What would MLK say about Black Lives Matter?", figureSlug: "martin-luther-king", live: true },
  { question: "Would MLK condemn riots?", figureSlug: "martin-luther-king", live: true },
  { question: "Would Franklin trade liberty for security?", figureSlug: "benjamin-franklin", live: false },
  { question: "What would Teddy Roosevelt do about Big Tech?", figureSlug: "theodore-roosevelt", live: false },
  { question: "What would Frederick Douglass make of modern America?", figureSlug: "frederick-douglass", live: false },
  { question: "Would Marcus Aurelius delete Twitter?", figureSlug: "marcus-aurelius", live: false },
];

export function cardHref(card: FeaturedCard | TrendingQuestion): string {
  return card.live
    ? `/chat/${card.figureSlug}?q=${encodeURIComponent(card.question)}`
    : `/figures/${card.figureSlug}`;
}
