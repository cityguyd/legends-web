import { render, screen } from "@testing-library/react";
import { test, expect, vi, beforeEach } from "vitest";

const getFeaturedQuestions = vi.fn();
vi.mock("@/lib/marketing/data", () => ({ getFeaturedQuestions: () => getFeaturedQuestions() }));

import HotQuestionsPage from "@/app/(marketing)/questions/page";

beforeEach(() => getFeaturedQuestions.mockReset());

test("lists published questions when present", async () => {
  getFeaturedQuestions.mockResolvedValue([
    { slug: "mlk-bla", question: "What would MLK think of Black America today?", figure_name: "Martin Luther King, Jr." },
  ]);
  render(await HotQuestionsPage());
  expect(screen.getByRole("heading", { name: /hot questions/i })).toBeDefined();
  const link = screen.getByRole("link", { name: /what would mlk think/i });
  expect(link.getAttribute("href")).toBe("/questions/mlk-bla");
});

test("shows an inviting empty state, not a placeholder apology", async () => {
  getFeaturedQuestions.mockResolvedValue([]);
  render(await HotQuestionsPage());
  expect(screen.getByRole("link", { name: /ask a bold question/i }).getAttribute("href")).toBe("/figures");
  expect(screen.queryByText(/on their way/i)).toBeNull();
});
