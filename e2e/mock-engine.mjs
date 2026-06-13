// Mock Legends Library engine for E2E (Playwright).
//
// A dependency-free Node HTTP server that mimics the FastAPI engine's two
// endpoints the web app talks to:
//
//   POST /api/chat   → data-only SSE stream (chunk / citations / confidence /
//                      done), exactly the shape `legends/api.py` `_sse()` emits:
//                      `data: {json}\n\n` with the event `type` inside the JSON.
//                      After ANON_DAILY_LIMIT successful requests it returns
//                      429 with FastAPI's `{"detail": "..."}` body, which is
//                      what useChatStream maps to status `{kind:"limited"}` →
//                      LimitModal kind="anon-daily" for anonymous callers.
//
//   GET  /api/usage  → { questions_used, questions_limit, tier, resets_at },
//                      mirroring the engine. The chat hook fetches this after
//                      every completed stream; it must not error.
//
// Run directly with `node e2e/mock-engine.mjs` (no build step, no deps).
// Port comes from MOCK_ENGINE_PORT (default 8787).

import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_ENGINE_PORT ?? 8787);

// Anonymous daily limit — the funnel test asks 3 questions then expects the
// 4th to be limited. Keep in sync with FREE_DAILY_ANON in ChatThread.
const ANON_DAILY_LIMIT = 3;

// Successful /api/chat streams served, keyed by session_id. The web app sends
// a fresh session_id per browser tab, so the count resets every test run even
// when Playwright reuses a long-lived mock-engine process (reuseExistingServer).
// Keying per session also mirrors the real engine's per-caller daily limit.
/** @type {Map<string, number>} */
const servedBySession = new Map();

// The confidence tier MUST be "strong" so ResponseCard renders the
// "Documented" badge (see ConfidenceBadge TIERS map).
function streamBody() {
  const events = [
    { type: "chunk", text: "I have a dream that one day this nation " },
    { type: "chunk", text: "will rise up and live out the true meaning of its creed." },
    {
      type: "citations",
      data: [
        {
          title: "I Have a Dream — Address at the March on Washington",
          url: "https://example.test/i-have-a-dream",
          year: 1963,
          snippet: "I have a dream that my four little children will one day live in a nation…",
        },
      ],
    },
    { type: "confidence", tier: "strong" },
    { type: "done" },
  ];
  return events.map((e) => `data: ${JSON.stringify(e)}\n\n`).join("");
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  // CORS preflight (the browser sends one before the cross-origin POST).
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/chat") {
    // Buffer the body to read session_id (the per-caller limit key).
    let raw = "";
    req.on("data", (c) => {
      raw += c;
    });
    req.on("end", () => {
      let sessionId = "anon";
      try {
        const parsed = JSON.parse(raw || "{}");
        if (typeof parsed.session_id === "string" && parsed.session_id) {
          sessionId = parsed.session_id;
        }
      } catch {
        /* keep default key */
      }

      const used = servedBySession.get(sessionId) ?? 0;
      if (used >= ANON_DAILY_LIMIT) {
        // FastAPI shape: HTTPException(429, "...") → {"detail": "..."}.
        sendJson(res, 429, { detail: "Daily free limit reached" });
        return;
      }
      servedBySession.set(sessionId, used + 1);
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(streamBody());
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/usage") {
    // The web client fetches usage without a session_id; report the max count
    // seen across sessions (the test doesn't assert this — it just must not
    // error so the hook's post-stream fetch succeeds).
    const used = Math.min(
      Math.max(0, ...servedBySession.values()),
      ANON_DAILY_LIMIT
    );
    sendJson(res, 200, {
      questions_used: used,
      questions_limit: ANON_DAILY_LIMIT,
      tier: "anonymous",
      resets_at: null,
    });
    return;
  }

  sendJson(res, 404, { detail: "Not found" });
});

server.listen(PORT, () => {
  // Playwright's webServer waits on this port; the log aids local debugging.
  console.log(`[mock-engine] listening on http://127.0.0.1:${PORT}`);
});
