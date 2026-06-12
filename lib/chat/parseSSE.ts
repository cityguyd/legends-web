/**
 * SSE buffer parser.
 *
 * Handles two SSE formats:
 *  1. Standard two-line format:   event: <type>\ndata: <json>\n\n
 *  2. Engine data-only format:    data: {"type":"<type>",...}\n\n
 *
 * The Legends Library engine uses format 2 (single data line with `type`
 * embedded in the JSON). Format 1 is supported so the spec-required tests
 * pass and the parser is forward-compatible with any future gateway.
 *
 * Per SSE spec, multiple `data:` lines within a single message are joined
 * with `\n`. CRLF sequences are normalised to `\n` at entry so the rest of
 * the parser only deals with `\n`.
 */

export type SSEEvent = { type: string; data: Record<string, unknown> };

export function parseSSEChunk(
  buffer: string
): { events: SSEEvent[]; rest: string } {
  // Normalise CRLF → LF (safe across chunk boundaries: a trailing lone \r
  // stays in `rest` and will be re-normalised on the next call).
  const normalised = buffer.replace(/\r\n/g, "\n");

  const events: SSEEvent[] = [];
  // Split on double-newline SSE message boundaries
  const parts = normalised.split("\n\n");
  // Last element is either empty (clean buffer) or an incomplete message
  const rest = parts.pop() ?? "";

  for (const part of parts) {
    if (!part.trim()) continue;

    let eventType = "message";
    const dataLines: string[] = [];
    let hasExplicitEvent = false;

    for (const line of part.split("\n")) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
        hasExplicitEvent = true;
      } else if (line.startsWith("data: ")) {
        // Collect each data line; per SSE spec they are joined with \n
        dataLines.push(line.slice(6));
      }
    }

    if (dataLines.length === 0) continue;

    const dataStr = dataLines.join("\n");

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(dataStr) as Record<string, unknown>;
    } catch {
      if (process.env.NODE_ENV === "development") {
        console.warn("[parseSSE] malformed JSON in SSE data — skipping event:", dataStr);
      }
      continue;
    }

    // Format 2: type embedded in JSON (engine native format)
    if (!hasExplicitEvent && typeof parsed["type"] === "string") {
      eventType = parsed["type"];
    }

    events.push({ type: eventType, data: parsed });
  }

  return { events, rest };
}
