import { render, screen } from "@testing-library/react";
import { FigureCard } from "@/components/marketing/FigureCard";

const base = {
  slug: "martin-luther-king",
  name: "Martin Luther King, Jr.",
  tagline: "Civil rights leader",
  era: "1929–1968",
  categories: ["Civil Rights"],
};

test("wave 1 figure shows Ask button", () => {
  render(<FigureCard figure={{ ...base, wave: 1 }} />);
  expect(screen.getByRole("link", { name: /ask mlk/i })).toHaveAttribute(
    "href",
    "/chat/martin-luther-king"
  );
});

test("wave 2 figure shows Coming Soon and no chat link", () => {
  render(<FigureCard figure={{ ...base, wave: 2 }} />);
  expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /ask/i })).toBeNull();
});
