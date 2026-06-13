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
    meta: "Civil Rights · Race · Medium-confidence inference",
    live: true,
  },
  {
    question: "Would Hamilton support Bitcoin?",
    figureSlug: "alexander-hamilton",
    figureShort: "Hamilton",
    meta: "Founding Era · Money · Debate-ready",
    live: false,
  },
  {
    question: "Would Churchill back Ukraine today?",
    figureSlug: "winston-churchill",
    figureShort: "Churchill",
    meta: "War · Alliances · Source-grounded inference",
    live: false,
  },
  {
    question: "What would Marcus Aurelius say about anxiety?",
    figureSlug: "marcus-aurelius",
    figureShort: "Marcus",
    meta: "Stoicism · Self-control · High-confidence answer",
    live: false,
  },
];

export const TRENDING_QUESTIONS: TrendingQuestion[] = [
  { question: "What would MLK say about Black Lives Matter?", figureSlug: "martin-luther-king", live: true },
  { question: "Would MLK condemn riots?", figureSlug: "martin-luther-king", live: true },
  { question: "Would Hamilton support the Federal Reserve?", figureSlug: "alexander-hamilton", live: false },
  { question: "Would Jefferson fear Big Tech?", figureSlug: "thomas-jefferson", live: false },
  { question: "Would Churchill negotiate with Putin?", figureSlug: "winston-churchill", live: false },
  { question: "Would Marcus Aurelius delete Twitter?", figureSlug: "marcus-aurelius", live: false },
];

export function cardHref(card: FeaturedCard | TrendingQuestion): string {
  return card.live
    ? `/chat/${card.figureSlug}?q=${encodeURIComponent(card.question)}`
    : `/figures/${card.figureSlug}`;
}
