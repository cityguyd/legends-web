import { render, screen, fireEvent } from "@testing-library/react";
import { ResponseCard } from "@/components/chat/ResponseCard";

const msg = { figureName: "Martin Luther King, Jr.", text: "Answer text",
  citations: [{ doc_title: "Letter from Birmingham Jail", year: 1963, snippet: "Quote…" }],
  confidence: "strong" as const };

test("renders figure name, body, confidence badge and citation chip", () => {
  render(<ResponseCard message={msg} />);
  expect(screen.getByText("Martin Luther King, Jr.")).toBeInTheDocument();
  expect(screen.getByText("Strong")).toBeInTheDocument();
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

test("tier 'refused' with no citations renders the Refused badge", () => {
  render(
    <ResponseCard message={{ text: "Answer", confidence: "refused" }} />
  );
  // ConfidenceBadge now renders for "refused" — EvidenceRow shows the badge row
  expect(screen.getByText("Refused")).toBeInTheDocument();
});

test("renders AI reconstruction header line with confidence label for strong tier", () => {
  render(<ResponseCard message={msg} />);
  expect(
    screen.getByText(/AI reconstruction · Primary-source grounded/i)
  ).toBeInTheDocument();
  // The confidence suffix is in the same <p> element
  expect(
    screen.getByText(/AI reconstruction · Primary-source grounded · Confidence: Strong/i)
  ).toBeInTheDocument();
});

test("renders 'What does this mean?' expandable summary", () => {
  render(<ResponseCard message={msg} />);
  expect(screen.getByText("What does this mean?")).toBeInTheDocument();
});

test("'What does this mean?' body mentions the figure name", () => {
  render(<ResponseCard message={msg} />);
  // details element is visible even when closed in jsdom; check the text
  expect(
    screen.getByText(/This is not a real statement by Martin Luther King, Jr\./i)
  ).toBeInTheDocument();
});

test("'What does this mean?' body uses generic fallback when no figureName", () => {
  render(<ResponseCard message={{ text: "Answer" }} />);
  expect(
    screen.getByText(/This is not a real statement by the figure\./i)
  ).toBeInTheDocument();
});

test("Receipts heading appears when message has a confidence badge or citations", () => {
  render(<ResponseCard message={msg} />);
  expect(screen.getByText("Receipts")).toBeInTheDocument();
});

test("Receipts heading appears for refused confidence with no citations", () => {
  render(
    <ResponseCard message={{ text: "Answer", confidence: "refused" }} />
  );
  expect(screen.getByText("Receipts")).toBeInTheDocument();
});

test("low-confidence warning appears for confidence 'refused'", () => {
  render(
    <ResponseCard message={{ text: "Answer", confidence: "refused" }} />
  );
  expect(screen.getByText(/source record is limited/i)).toBeInTheDocument();
});

test("low-confidence warning is absent for confidence 'strong'", () => {
  render(<ResponseCard message={msg} />);
  expect(screen.queryByText(/source record is limited/i)).toBeNull();
});
