import { test, expect } from "vitest";
import { FEATURED_CARDS, TRENDING_QUESTIONS, cardHref } from "@/lib/marketing/homeCards";

test("featured cards are non-empty and well-formed", () => {
  expect(FEATURED_CARDS.length).toBeGreaterThanOrEqual(4);
  for (const c of FEATURED_CARDS) {
    expect(c.question.length).toBeGreaterThan(0);
    expect(c.figureSlug.length).toBeGreaterThan(0);
    expect(c.meta.length).toBeGreaterThan(0);
  }
});

test("live figures deep-link to chat with prefilled q; others to the profile", () => {
  const live = cardHref({ question: "Q?", figureSlug: "martin-luther-king", figureShort: "MLK", meta: "", live: true });
  expect(live.startsWith("/chat/martin-luther-king?q=")).toBe(true);
  expect(decodeURIComponent(live.split("q=")[1])).toBe("Q?");

  const soon = cardHref({ question: "Q?", figureSlug: "alexander-hamilton", figureShort: "Hamilton", meta: "", live: false });
  expect(soon).toBe("/figures/alexander-hamilton");
});

test("trending questions are non-empty", () => {
  expect(TRENDING_QUESTIONS.length).toBeGreaterThanOrEqual(5);
  for (const t of TRENDING_QUESTIONS) expect(t.question.length).toBeGreaterThan(0);
});
