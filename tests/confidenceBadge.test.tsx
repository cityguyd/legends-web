import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import { ConfidenceBadge, confidenceLabel, isRenderableTier } from "@/components/chat/ConfidenceBadge";

test("labels are the capitalized engine tiers", () => {
  expect(confidenceLabel("strong")).toBe("Strong");
  expect(confidenceLabel("inferred")).toBe("Inferred");
  expect(confidenceLabel("refused")).toBe("Refused");
  expect(confidenceLabel("bogus")).toBeNull();
});

test("renders the label", () => {
  render(<ConfidenceBadge tier="strong" />);
  expect(screen.getByText("Strong")).toBeDefined();
});

test("isRenderableTier accepts the engine tiers", () => {
  expect(isRenderableTier("strong")).toBe(true);
  expect(isRenderableTier("inferred")).toBe(true);
  expect(isRenderableTier("refused")).toBe(true);
  expect(isRenderableTier("nope")).toBe(false);
});
