import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import { ComingSoon } from "@/components/marketing/ComingSoon";

test("renders the feature name and the bold-question CTA", () => {
  render(<ComingSoon feature="Debates" />);
  expect(screen.getByRole("heading", { name: /feature coming soon/i })).toBeDefined();
  expect(screen.getByText(/Debates/)).toBeDefined();
  const cta = screen.getByRole("link", { name: /ask a bold question/i });
  expect(cta.getAttribute("href")).toBe("/figures");
  expect(screen.getByRole("link", { name: /back to home/i }).getAttribute("href")).toBe("/");
});
