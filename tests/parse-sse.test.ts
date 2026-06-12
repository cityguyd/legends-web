import { describe, expect, test } from "vitest";
import { parseSSEChunk } from "@/lib/chat/parseSSE";
import {
  applyEvent,
  makeChatState,
  chunkRevealSlice,
} from "@/lib/chat/chatReducer";

// ── parseSSEChunk ─────────────────────────────────────────────────────────────

test("parses chunk, citations, confidence, done events from a buffer", () => {
  const buf =
    'event: chunk\ndata: {"text":"Hello"}\n\n' +
    'event: citations\ndata: {"citations":[{"doc_title":"Letter","year":1963}]}\n\n' +
    'event: confidence\ndata: {"tier":"strong"}\n\n' +
    "event: done\ndata: {}\n\n";
  const { events, rest } = parseSSEChunk(buf);
  expect(events.map((e) => e.type)).toEqual([
    "chunk",
    "citations",
    "confidence",
    "done",
  ]);
  expect(rest).toBe("");
});

test("keeps incomplete trailing event in rest buffer", () => {
  const { events, rest } = parseSSEChunk('event: chunk\ndata: {"te');
  expect(events).toEqual([]);
  expect(rest).toBe('event: chunk\ndata: {"te');
});

test("parses engine-style data-only SSE (type inside JSON)", () => {
  const buf =
    'data: {"type":"chunk","text":"Hello world"}\n\n' +
    'data: {"type":"citations","data":[]}\n\n' +
    'data: {"type":"confidence","tier":"strong"}\n\n' +
    'data: {"type":"done"}\n\n';
  const { events, rest } = parseSSEChunk(buf);
  expect(events.map((e) => e.type)).toEqual([
    "chunk",
    "citations",
    "confidence",
    "done",
  ]);
  expect(rest).toBe("");
});

test("handles context_chip event", () => {
  const buf = 'data: {"type":"context_chip","label":"mental health"}\n\n';
  const { events } = parseSSEChunk(buf);
  expect(events[0].type).toBe("context_chip");
  expect((events[0].data as { label: string }).label).toBe("mental health");
});

// ── chatReducer ───────────────────────────────────────────────────────────────

describe("applyEvent — state machine transitions", () => {
  test("chunk event appends to fullText buffer", () => {
    const state = makeChatState();
    const next = applyEvent(state, { type: "chunk", data: { text: "Hello" } });
    expect(next.fullText).toBe("Hello");
  });

  test("citations event stores citations", () => {
    const state = makeChatState();
    const cits = [{ title: "Letter", url: null, year: 1963, snippet: "text" }];
    const next = applyEvent(state, {
      type: "citations",
      data: { data: cits },
    });
    expect(next.pendingCitations).toEqual(cits);
  });

  test("confidence event stores tier", () => {
    const state = makeChatState();
    const next = applyEvent(state, {
      type: "confidence",
      data: { tier: "strong" },
    });
    expect(next.pendingConfidence).toBe("strong");
  });

  test("done event marks readyToReveal", () => {
    const state = makeChatState();
    const next = applyEvent(state, { type: "done", data: {} });
    expect(next.readyToReveal).toBe(true);
  });

  test("context_chip event stores label", () => {
    const state = makeChatState();
    const next = applyEvent(state, {
      type: "context_chip",
      data: { label: "mental health" },
    });
    expect(next.contextChip).toBe("mental health");
  });

  test("full sequence chunk→citations→confidence→done", () => {
    let state = makeChatState();
    state = applyEvent(state, {
      type: "chunk",
      data: { text: "Nonviolence is the path." },
    });
    state = applyEvent(state, {
      type: "citations",
      data: {
        data: [{ title: "Letter", url: null, year: 1963, snippet: "..." }],
      },
    });
    state = applyEvent(state, {
      type: "confidence",
      data: { tier: "inferred" },
    });
    state = applyEvent(state, { type: "done", data: {} });

    expect(state.fullText).toBe("Nonviolence is the path.");
    expect(state.pendingCitations).toHaveLength(1);
    expect(state.pendingConfidence).toBe("inferred");
    expect(state.readyToReveal).toBe(true);
  });
});

// ── chunkRevealSlice ──────────────────────────────────────────────────────────

describe("chunkRevealSlice — typing reveal helper", () => {
  test("returns next 40 chars from offset", () => {
    const text = "a".repeat(100);
    const { slice, nextOffset, done } = chunkRevealSlice(text, 0, 40);
    expect(slice).toBe("a".repeat(40));
    expect(nextOffset).toBe(40);
    expect(done).toBe(false);
  });

  test("returns remainder when fewer than 40 chars remain", () => {
    const text = "Hello";
    const { slice, nextOffset, done } = chunkRevealSlice(text, 0, 40);
    expect(slice).toBe("Hello");
    expect(nextOffset).toBe(5);
    expect(done).toBe(true);
  });

  test("marks done when offset already at end", () => {
    const { done } = chunkRevealSlice("Hello", 5, 40);
    expect(done).toBe(true);
  });
});
