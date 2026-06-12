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
 */

export type SSEEvent = { type: string; data: Record<string, unknown> };

export function parseSSEChunk(
  buffer: string
): { events: SSEEvent[]; rest: string } {
  const events: SSEEvent[] = [];
  // Split on double-newline SSE message boundaries
  const parts = buffer.split("\n\n");
  // Last element is either empty (clean buffer) or an incomplete message
  const rest = parts.pop() ?? "";

  for (const part of parts) {
    if (!part.trim()) continue;

    let eventType = "message";
    let dataStr = "";
    let hasExplicitEvent = false;

    for (const line of part.split("\n")) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
        hasExplicitEvent = true;
      } else if (line.startsWith("data: ")) {
        dataStr += line.slice(6);
      }
    }

    if (!dataStr) continue;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(dataStr) as Record<string, unknown>;
    } catch {
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
