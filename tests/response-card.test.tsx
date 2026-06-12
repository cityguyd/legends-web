import { render, screen } from "@testing-library/react";
import { ResponseCard } from "@/components/chat/ResponseCard";

const msg = { figureName: "Martin Luther King, Jr.", text: "Answer text",
  citations: [{ doc_title: "Letter from Birmingham Jail", year: 1963, snippet: "Quote…" }],
  confidence: "strong" as const };

test("renders figure name, body, confidence badge and citation chip", () => {
  render(<ResponseCard message={msg} />);
  expect(screen.getByText("Martin Luther King, Jr.")).toBeInTheDocument();
  expect(screen.getByText("Documented")).toBeInTheDocument();
  expect(screen.getByText(/letter from birmingham jail, 1963/i)).toBeInTheDocument();
});

test("citation chip expands snippet on click", async () => {
  const { getByText, queryByText, findByText } = render(<ResponseCard message={msg} />);
  expect(queryByText("Quote…")).toBeNull();
  getByText(/letter from birmingham jail/i).click();
  expect(await findByText("Quote…")).toBeInTheDocument();
});
