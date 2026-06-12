import { render, screen, fireEvent } from "@testing-library/react";
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
  fireEvent.click(getByText(/letter from birmingham jail/i));
  expect(await findByText("Quote…")).toBeInTheDocument();
});

test("citation chip collapses snippet on second click", async () => {
  const { getByText, queryByText, findByText } = render(<ResponseCard message={msg} />);
  const chip = getByText(/letter from birmingham jail/i);
  fireEvent.click(chip);
  expect(await findByText("Quote…")).toBeInTheDocument();
  fireEvent.click(chip);
  expect(queryByText("Quote…")).toBeNull();
});

test("unknown tier 'refused' with no citations renders nothing", () => {
  const { container } = render(
    <ResponseCard message={{ text: "Answer", confidence: "refused" }} />
  );
  // EvidenceRow returns null — no border-t divider rendered
  expect(container.querySelector(".border-t.border-border.pt-3")).toBeNull();
});
