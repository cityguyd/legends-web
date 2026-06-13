import { render, screen } from "@testing-library/react";
import { test, expect, vi, beforeEach } from "vitest";

const getFigureBySlug = vi.fn();
const getSourcesForFigure = vi.fn();
vi.mock("@/lib/marketing/data", async (orig) => {
  const actual = await orig<typeof import("@/lib/marketing/data")>();
  return {
    ...actual,
    getFigureBySlug: (s: string) => getFigureBySlug(s),
    getSourcesForFigure: (id: string) => getSourcesForFigure(id),
  };
});
vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("notFound"); } }));

import FigureSourcesPage from "@/app/(marketing)/sources/[slug]/page";

beforeEach(() => {
  getFigureBySlug.mockReset();
  getSourcesForFigure.mockReset();
});

test("renders the figure's source documents", async () => {
  getFigureBySlug.mockResolvedValue({ id: "f1", slug: "martin-luther-king", name: "Martin Luther King, Jr.", wave: 1 });
  getSourcesForFigure.mockResolvedValue([
    { id: "s1", doc_title: "Letter from Birmingham Jail", doc_type: "letter", year: 1963, license: "public_domain" },
  ]);
  render(await FigureSourcesPage({ params: Promise.resolve({ slug: "martin-luther-king" }) }));
  expect(screen.getByText(/Letter from Birmingham Jail/)).toBeDefined();
});

test("shows 'library in progress' when no active sources", async () => {
  getFigureBySlug.mockResolvedValue({ id: "f2", slug: "winston-churchill", name: "Winston Churchill", wave: 2 });
  getSourcesForFigure.mockResolvedValue([]);
  render(await FigureSourcesPage({ params: Promise.resolve({ slug: "winston-churchill" }) }));
  expect(screen.getByText(/in progress/i)).toBeDefined();
});
