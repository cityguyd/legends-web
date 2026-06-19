/**
 * Integration tests for useChatStream.
 *
 * Strategy:
 *  - Mock fetch globally (vi.fn).
 *  - Mock @/lib/supabase/client so getSession returns null (anon user).
 *  - Stub requestAnimationFrame / cancelAnimationFrame to fire synchronously
 *    via setTimeout(0) so the typing-reveal loop completes without needing
 *    fake timers in the read loop.
 *  - Use vi.waitFor() to await async state transitions.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useChatStream } from "@/lib/chat/useChatStream";

// ── Mock Supabase ─────────────────────────────────────────────────────────────

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a ReadableStream that emits the given SSE string in one chunk. */
function sseStream(body: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });
}

/** Build a standard SSE body for a successful chat response. */
function successSSE(text = "Hello from the figure"): string {
  return (
    `data: {"type":"chunk","text":"${text}"}\n\n` +
    `data: {"type":"citations","data":[{"title":"Source","url":null,"year":1963,"snippet":"..."}]}\n\n` +
    `data: {"type":"confidence","tier":"strong"}\n\n` +
    `data: {"type":"done"}\n\n`
  );
}

/** Build a Response whose body is the given SSE string. */
function sseResponse(body: string, status = 200): Response {
  return new Response(sseStream(body), {
    status,
    headers: { "Content-Type": "text/event-stream" },
  });
}

const DEFAULT_OPTS = {
  figureSlug: "mlk",
  figureName: "Martin Luther King Jr.",
};

// ── rAF stub ──────────────────────────────────────────────────────────────────
// Make requestAnimationFrame fire callbacks via setTimeout(0) so tests don't
// need fake timers just for the reveal loop.

let originalRAF: typeof requestAnimationFrame;
let originalCAF: typeof cancelAnimationFrame;

beforeEach(() => {
  originalRAF = global.requestAnimationFrame;
  originalCAF = global.cancelAnimationFrame;
  global.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(performance.now()), 0) as unknown as number;
  global.cancelAnimationFrame = (id: number) => clearTimeout(id);
});

afterEach(() => {
  global.requestAnimationFrame = originalRAF;
  global.cancelAnimationFrame = originalCAF;
  vi.restoreAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useChatStream", () => {
  test("(a) successful stream → messages committed, status complete", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        // POST /api/chat
        .mockResolvedValueOnce(sseResponse(successSSE()))
        // GET /api/usage
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ questions_used: 1, questions_limit: 10 }),
            { status: 200 }
          )
        )
    );

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));

    await act(async () => {
      result.current.send("What is your dream?");
    });

    // Wait for the typing reveal to finish
    await vi.waitFor(
      () => {
        expect(result.current.status).toBe("complete");
      },
      { timeout: 3000 }
    );

    const msgs = result.current.messages;
    // user message + figure message
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe("user");
    expect(msgs[0].text).toBe("What is your dream?");
    expect(msgs[1].role).toBe("figure");
    expect(msgs[1].text).toBe("Hello from the figure");
    expect(msgs[1].confidence).toBe("strong");
    expect(msgs[1].citations).toHaveLength(1);
    expect(msgs[1].citations![0].title).toBe("Source");
    // remaining and limit updated from usage endpoint
    expect(result.current.remaining).toBe(9);
    expect(result.current.limit).toBe(10);
    // pendingQuestion cleared after success
    // (internal ref; we verify it doesn't surface on a no-op retry)
    const fetchSpy = vi.mocked(fetch);
    const callCount = fetchSpy.mock.calls.length; // 2 (chat + usage)
    result.current.retry(); // should no-op (status is "complete")
    await vi.waitFor(() => {
      expect(fetchSpy.mock.calls.length).toBe(callCount); // no extra fetch
    });
  });

  test("(b) stream closes WITHOUT done → status error, no figure message committed", async () => {
    const truncatedSSE = `data: {"type":"chunk","text":"partial"}\n\n`;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(sseResponse(truncatedSSE))
    );

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));

    await act(async () => {
      result.current.send("Tell me about yourself");
    });

    await vi.waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    // Only user message present; no figure message committed
    const msgs = result.current.messages;
    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe("user");
  });

  test("(c) 429 → status limited with detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({ detail: "You have used all 5 free questions." }),
          { status: 429 }
        )
      )
    );

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));

    await act(async () => {
      result.current.send("Question");
    });

    await vi.waitFor(() => {
      expect(result.current.status).toMatchObject({
        kind: "limited",
        detail: "You have used all 5 free questions.",
      });
    });

    expect(result.current.limitDetail).toBe(
      "You have used all 5 free questions."
    );
  });

  test("(d) 409 → status blocked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(new Response(null, { status: 409 }))
    );

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));

    await act(async () => {
      result.current.send("Question");
    });

    await vi.waitFor(() => {
      expect(result.current.status).toMatchObject({ kind: "blocked" });
    });
  });

  test("(e) network reject → error, then retry() re-sends and succeeds", async () => {
    const fetchSpy = vi
      .fn()
      // First call: network failure
      .mockRejectedValueOnce(new TypeError("network error"))
      // Second call (retry): success
      .mockResolvedValueOnce(sseResponse(successSSE("Retry response")))
      // Third call: usage
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ questions_used: 2, questions_limit: 10 }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchSpy);

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));

    await act(async () => {
      result.current.send("Will this fail?");
    });

    await vi.waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    // retry() should re-send
    await act(async () => {
      result.current.retry();
    });

    await vi.waitFor(
      () => {
        expect(result.current.status).toBe("complete");
      },
      { timeout: 3000 }
    );

    const msgs = result.current.messages;
    expect(msgs[msgs.length - 1].role).toBe("figure");
    expect(msgs[msgs.length - 1].text).toBe("Retry response");
  });

  test("(g) figureSlug change mid-stream → status idle, messages cleared", async () => {
    // Use a never-resolving fetch so the stream hangs in "consulting" / "typing"
    // long enough to rerender with a different slug.
    let rejectFetch!: (reason: unknown) => void;
    const hangingFetch = new Promise<Response>((_resolve, reject) => {
      rejectFetch = reject;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(hangingFetch));

    const { result, rerender } = renderHook(
      (props: { figureSlug: string; figureName: string }) =>
        useChatStream(props),
      { initialProps: DEFAULT_OPTS }
    );

    // Start a stream
    act(() => {
      result.current.send("What did you stand for?");
    });

    // Should move to consulting right away
    await vi.waitFor(() => {
      expect(result.current.status).toBe("consulting");
    });

    // Confirm user message is present
    expect(result.current.messages).toHaveLength(1);

    // Change the figure slug — simulates navigating to a different figure
    act(() => {
      rerender({ figureSlug: "einstein", figureName: "Albert Einstein" });
    });

    // Reject the hanging fetch so there are no unhandled-promise warnings
    rejectFetch(new DOMException("aborted", "AbortError"));

    // After slug change: status must be "idle" and messages must be empty
    await vi.waitFor(() => {
      expect(result.current.status).toBe("idle");
    });
    expect(result.current.messages).toHaveLength(0);
  });

  test("(h) unlimited (pro) user: questions_limit null → remaining stays null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        // POST /api/chat
        .mockResolvedValueOnce(sseResponse(successSSE()))
        // GET /api/usage — pro user, no limit
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ questions_used: 42, questions_limit: null }),
            { status: 200 }
          )
        )
    );

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));

    await act(async () => {
      result.current.send("Unlimited question");
    });

    await vi.waitFor(
      () => {
        expect(result.current.status).toBe("complete");
      },
      { timeout: 3000 }
    );

    // remaining and limit must stay null — not NaN or negative
    expect(result.current.remaining).toBeNull();
    expect(result.current.limit).toBeNull();
  });

  test("(i) refusal stream → refusalContext committed on figure message", async () => {
    const refusalSSE =
      `data: {"type":"refusal_context","sources_checked":[{"title":"Gospel of Matthew","url":"https://m","year":30}],"adjacent_question":"What did Jesus say about forgiveness?"}\n\n` +
      `data: {"type":"chunk","text":"I won't speculate beyond the record."}\n\n` +
      `data: {"type":"citations","data":[]}\n\n` +
      `data: {"type":"confidence","tier":"refused"}\n\n` +
      `data: {"type":"done"}\n\n`;
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce(sseResponse(refusalSSE))
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ questions_used: 1, questions_limit: 10 }),
            { status: 200 }
          )
        )
    );

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));

    await act(async () => {
      result.current.send("What did Jesus say about quantum physics?");
    });

    await vi.waitFor(
      () => {
        expect(result.current.status).toBe("complete");
      },
      { timeout: 3000 }
    );

    const fig = result.current.messages[1];
    expect(fig.confidence).toBe("refused");
    expect(fig.refusalContext?.adjacentQuestion).toBe(
      "What did Jesus say about forgiveness?"
    );
    expect(fig.refusalContext?.sourcesChecked).toHaveLength(1);
    expect(fig.refusalContext?.sourcesChecked[0].title).toBe(
      "Gospel of Matthew"
    );
  });

  test("(j) sends prior turns as history in the request body", async () => {
  const fetchSpy = vi.fn()
    .mockResolvedValueOnce(sseResponse(successSSE("First.")))
    .mockResolvedValueOnce(new Response(JSON.stringify(
      { questions_used: 1, questions_limit: 10 }), { status: 200 }))
    .mockResolvedValueOnce(sseResponse(successSSE("Second.")))
    .mockResolvedValueOnce(new Response(JSON.stringify(
      { questions_used: 2, questions_limit: 10 }), { status: 200 }));
  vi.stubGlobal("fetch", fetchSpy);

  const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));
  await act(async () => { result.current.send("First question?"); });
  await vi.waitFor(() => expect(result.current.status).toBe("complete"), { timeout: 3000 });
  await act(async () => { result.current.send("Second question?"); });
  await vi.waitFor(() => expect(result.current.status).toBe("complete"), { timeout: 3000 });

  // 3rd fetch call (index 2) is the 2nd /api/chat — body should carry history
  const body = JSON.parse(fetchSpy.mock.calls[2][1].body as string);
  expect(body.history).toEqual([
    { role: "user", content: "First question?" },
    { role: "assistant", content: "First." },
  ]);
  expect(body.question).toBe("Second question?");
});

  test("(k) truncated done → message.truncated true; continueAnswer re-requests with partial answer", async () => {
    const truncatedSSE =
      `data: {"type":"chunk","text":"Half an answer"}\n\n` +
      `data: {"type":"confidence","tier":"strong"}\n\n` +
      `data: {"type":"done","truncated":true,"input_tokens":5,"output_tokens":1024}\n\n`;
    const fetchSpy = vi.fn()
      .mockResolvedValueOnce(sseResponse(truncatedSSE))
      .mockResolvedValueOnce(new Response(JSON.stringify(
        { questions_used: 1, questions_limit: 10 }), { status: 200 }))
      .mockResolvedValueOnce(sseResponse(successSSE("The rest of it.")))
      .mockResolvedValueOnce(new Response(JSON.stringify(
        { questions_used: 2, questions_limit: 10 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));
    await act(async () => { result.current.send("Tell me everything."); });
    await vi.waitFor(() => expect(result.current.status).toBe("complete"), { timeout: 3000 });

    const figureMsg = result.current.messages[1];
    expect(figureMsg.role).toBe("figure");
    expect(figureMsg.truncated).toBe(true);

    await act(async () => { result.current.continueAnswer(); });
    await vi.waitFor(() => expect(result.current.status).toBe("complete"), { timeout: 3000 });

    // 3rd fetch (index 2) is the continuation POST; its history includes the partial answer.
    const body = JSON.parse(fetchSpy.mock.calls[2][1].body as string);
    const lastTurn = body.history[body.history.length - 1];
    expect(lastTurn).toEqual({ role: "assistant", content: "Half an answer" });
  });

  test("(f) retry() after success is a no-op (fetch not called again)", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(sseResponse(successSSE()))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ questions_used: 1, questions_limit: 10 }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchSpy);

    const { result } = renderHook(() => useChatStream(DEFAULT_OPTS));

    await act(async () => {
      result.current.send("Hello");
    });

    await vi.waitFor(() => {
      expect(result.current.status).toBe("complete");
    }, { timeout: 3000 });

    const callsAfterSuccess = fetchSpy.mock.calls.length; // 2

    // retry() after complete must be a no-op
    act(() => {
      result.current.retry();
    });

    // Give it a tick to ensure no extra fetch was fired
    await new Promise((r) => setTimeout(r, 50));
    expect(fetchSpy.mock.calls.length).toBe(callsAfterSuccess);
  });
});
