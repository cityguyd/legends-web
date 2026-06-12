import { render, screen } from "@testing-library/react";
import {
  ConfidenceBadge,
  type ConfidenceTier,
} from "@/components/chat/ConfidenceBadge";

test.each([
  ["strong", "Documented"],
  ["inferred", "Inferred"],
  ["speculative", "Speculative"],
])("tier %s renders label %s", (tier, label) => {
  render(<ConfidenceBadge tier={tier as ConfidenceTier} />);
  expect(screen.getByText(label)).toBeInTheDocument();
});
