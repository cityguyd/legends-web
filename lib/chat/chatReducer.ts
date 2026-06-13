/**
 * Pure state logic for the chat stream client.
 * Extracted from the hook so it can be unit-tested without React or fetch mocks.
 */

import type { SSEEvent } from "./parseSSE";

// ── Types ────────────────────────────────────────────────────────────────────

export type ConfidenceTier = "strong" | "inferred" | "refused";

export interface Citation {
  title: string;
  url: string | null;
  year: number | null;
  snippet: string;
}

export interface ChatMessage {
  role: "user" | "figure";
  /** Display name for the figure (undefined for user messages) */
  figureName?: string;
  text: string;
  citations?: Citation[];
  confidence?: ConfidenceTier;
  /** Context chip label surfaced by the engine (Task 13 renders this) */
  contextChip?: string;
}

export type ChatStatus =
  | "idle"
  | "consulting"
  | "typing"
  | "complete"
  | "error"
  | { kind: "blocked"; message: string }
  | { kind: "limited"; detail: string };

/**
 * In-flight stream accumulation state.
 * Tracks data as it arrives from the SSE stream before it is committed to
 * the visible messages array.
 */
export interface StreamAccumulator {
  fullText: string;
  pendingCitations: Citation[];
  pendingConfidence: ConfidenceTier;
  contextChip: string | null;
  readyToReveal: boolean;
}

export function makeChatState(): StreamAccumulator {
  return {
    fullText: "",
    pendingCitations: [],
    pendingConfidence: "inferred",
    contextChip: null,
    readyToReveal: false,
  };
}

// ── Event → accumulator reducer ──────────────────────────────────────────────

export function applyEvent(
  state: StreamAccumulator,
  event: SSEEvent
): StreamAccumulator {
  const d = event.data;

  switch (event.type) {
    case "chunk": {
      const text = typeof d["text"] === "string" ? d["text"] : "";
      return { ...state, fullText: state.fullText + text };
    }

    case "citations": {
      const raw = d["data"];
      const citations = parseCitationsPayload(raw);
      return { ...state, pendingCitations: citations };
    }

    case "confidence": {
      const tier = d["tier"];
      return {
        ...state,
        pendingConfidence: isConfidenceTier(tier) ? tier : "inferred",
      };
    }

    case "done":
      return { ...state, readyToReveal: true };

    case "context_chip": {
      const label = d["label"];
      return {
        ...state,
        contextChip: typeof label === "string" ? label : null,
      };
    }

    default:
      return state;
  }
}

// ── Typing reveal helper ─────────────────────────────────────────────────────

export interface RevealSlice {
  slice: string;
  nextOffset: number;
  done: boolean;
}

/**
 * Returns the next slice of `text` to reveal during the typing animation.
 * @param text      Full text to reveal
 * @param offset    Current character offset (already revealed)
 * @param chunkSize Characters to advance per frame (default 40)
 */
export function chunkRevealSlice(
  text: string,
  offset: number,
  chunkSize: number = 40
): RevealSlice {
  if (offset >= text.length) {
    return { slice: "", nextOffset: offset, done: true };
  }
  const end = Math.min(offset + chunkSize, text.length);
  return {
    slice: text.slice(offset, end),
    nextOffset: end,
    done: end >= text.length,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isConfidenceTier(value: unknown): value is ConfidenceTier {
  return (
    value === "strong" ||
    value === "inferred" ||
    value === "refused"
  );
}

function parseCitationsPayload(raw: unknown): Citation[] {
  if (!Array.isArray(raw)) return [];
  const result: Citation[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const obj = item as Record<string, unknown>;
    const title = typeof obj["title"] === "string" ? obj["title"] : null;
    if (!title) continue;
    result.push({
      title,
      url: typeof obj["url"] === "string" ? obj["url"] : null,
      year: typeof obj["year"] === "number" ? obj["year"] : null,
      snippet: typeof obj["snippet"] === "string" ? obj["snippet"] : "",
    });
  }
  return result;
}
