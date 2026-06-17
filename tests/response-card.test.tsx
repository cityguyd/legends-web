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

test("tier 'refused' renders the premium heading, not a raw 'Refused' badge", () => {
  render(
    <ResponseCard message={{ text: "Answer", confidence: "refused" }} />
  );
  // WS3: the premium refusal card replaces the raw "Refused" badge/Receipts row.
  expect(screen.getByText("Outside the Record")).toBeInTheDocument();
  expect(screen.queryByText("Refused")).toBeNull();
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

test("refused confidence no longer shows the generic Receipts row", () => {
  // WS3: refusals use the dedicated premium card, not the Receipts/EvidenceRow.
  render(
    <ResponseCard message={{ text: "Answer", confidence: "refused" }} />
  );
  expect(screen.queryByText("Receipts")).toBeNull();
});

test("refused confidence no longer shows the generic low-confidence warning", () => {
  // The premium refusal card carries the framing instead.
  render(
    <ResponseCard message={{ text: "Answer", confidence: "refused" }} />
  );
  expect(screen.queryByText(/source record is limited/i)).toBeNull();
});

test("low-confidence warning is absent for confidence 'strong'", () => {
  render(<ResponseCard message={msg} />);
  expect(screen.queryByText(/source record is limited/i)).toBeNull();
});

// ── Premium refusal card (WS3) ───────────────────────────────────────────────

const refusalMsg = {
  figureName: "Jesus of Nazareth",
  text: "I won't speculate beyond what the Gospels record.",
  confidence: "refused" as const,
  refusalContext: {
    sourcesChecked: [
      { title: "Gospel of Matthew", url: "https://m", year: 30 },
      { title: "Sermon on the Mount", url: null, year: null },
    ],
    adjacentQuestion: "What did Jesus say about forgiveness?",
  },
};

test("refusal card shows the heading, body, and sources checked", () => {
  render(<ResponseCard message={refusalMsg} refusalHeading="Outside the Record" />);
  expect(screen.getByText("Outside the Record")).toBeInTheDocument();
  expect(
    screen.getByText(/won't speculate beyond what the Gospels record/i)
  ).toBeInTheDocument();
  expect(screen.getByText(/Sources I checked/i)).toBeInTheDocument();
  expect(screen.getByText(/Gospel of Matthew/)).toBeInTheDocument();
});

test("refusal card never uses the words error, failed, or can't in its chrome", () => {
  const { container } = render(
    <ResponseCard message={refusalMsg} refusalHeading="Outside the Record" />
  );
  // The figure's own body text is exempt; check the chrome labels only.
  expect(screen.queryByText(/\berror\b/i)).toBeNull();
  expect(screen.queryByText(/\bfailed\b/i)).toBeNull();
  expect(container.textContent).not.toMatch(/Refused/); // premium heading replaces the raw badge label
});

test("refusal card shows the 'source we missed' prompt when a figureSlug is given", () => {
  render(
    <ResponseCard
      message={refusalMsg}
      refusalHeading="Outside the Record"
      figureSlug="jesus-of-nazareth"
      question="What did Jesus say about quantum physics?"
    />
  );
  expect(
    screen.getByRole("button", { name: /miss a source relevant to this question/i })
  ).toBeInTheDocument();
});

test("'source we missed' prompt reveals the source + email inputs on click", () => {
  render(
    <ResponseCard
      message={refusalMsg}
      refusalHeading="Outside the Record"
      figureSlug="jesus-of-nazareth"
    />
  );
  fireEvent.click(
    screen.getByRole("button", { name: /miss a source relevant to this question/i })
  );
  expect(
    screen.getByLabelText(/source link or description/i)
  ).toBeInTheDocument();
  expect(screen.getByLabelText(/email \(optional\)/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
});

test("source-suggestion prompt is absent without a figureSlug", () => {
  render(<ResponseCard message={refusalMsg} refusalHeading="Outside the Record" />);
  expect(
    screen.queryByRole("button", { name: /miss a source relevant to this question/i })
  ).toBeNull();
});

test("'Ask this' fires onAskAdjacent with the adjacent question", () => {
  const onAskAdjacent = vi.fn();
  render(
    <ResponseCard
      message={refusalMsg}
      refusalHeading="Outside the Record"
      onAskAdjacent={onAskAdjacent}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: /ask this/i }));
  expect(onAskAdjacent).toHaveBeenCalledWith(
    "What did Jesus say about forgiveness?"
  );
});
