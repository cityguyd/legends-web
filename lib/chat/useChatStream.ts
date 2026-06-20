"use client";

/**
 * useChatStream — React hook for the Legends Library SSE chat client.
 *
 * Engine contract (api.py):
 *   POST /api/chat  { figure_slug, question, session_id, voice_mode? }
 *   Response: text/event-stream — data-only SSE, type field inside JSON
 *   Events: chunk | citations | confidence | done | context_chip
 *   Errors: 404 unknown figure, 409 corpus gate, 429 rate/daily limit
 *
 * Usage endpoint (api.py):
 *   GET /api/usage?figure_slug=<slug>
 *   Response: { questions_used, questions_limit, tier, resets_at }
 *
 * Remaining questions is fetched from /api/usage after each complete stream.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseSSEChunk } from "./parseSSE";
import {
  applyEvent,
  chunkRevealSlice,
  makeChatState,
} from "./chatReducer";
import type {
  ChatMessage,
  ChatStatus,
  Citation,
  ConfidenceTier,
  RefusalContext,
  StreamAccumulator,
} from "./chatReducer";

// Re-export types the UI layer needs
export type { ChatMessage, ChatStatus, Citation, ConfidenceTier, RefusalContext };

// ── Public hook interface ────────────────────────────────────────────────────

export interface UseChatStreamOptions {
  /** figure_slug sent to the engine */
  figureSlug: string;
  /** Display name shown in figure messages (used by Task 13 UI) */
  figureName: string;
  /** voice_mode forwarded to engine; defaults to "modern" */
  voiceMode?: string;
  /**
   * Messages to seed the thread with — e.g. the original Hot Question + the
   * figure's cached answer, so a follow-up continues that exchange instead of
   * opening a blank chat. Shown read-only above the live turns.
   */
  initialMessages?: ChatMessage[];
  /** When set, completed turns are persisted server-side under this id. */
  conversationId?: string;
}

export interface UseChatStreamResult {
  messages: ChatMessage[];
  status: ChatStatus;
  /** Remaining daily free questions (null while unknown) */
  remaining: number | null;
  /**
   * Daily question limit from the usage response (null for unlimited/unknown).
   * Sourced from questions_limit when it is a number.
   */
  limit: number | null;
  /**
   * Limit detail string on 429 — derived from status for convenience.
   * Equivalent to (status as {kind:"limited";detail:string}).detail ?? null.
   */
  limitDetail: string | null;
  send: (question: string) => void;
  retry: () => void;
  continueAnswer: () => void;
  regenerate: () => void;
  editLast: (newText: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CHARS_PER_FRAME = 40;
const MAX_HISTORY_TURNS = 8; // last N committed messages sent as context
const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? "";
const CONTINUE_PROMPT = "Please continue your previous answer from exactly where it stopped.";

/** Returns a stable browser-tab session id, or a short random token on SSR. */
function getSessionId(): string {
  if (typeof window === "undefined") {
    // Server-side render path — return a one-off id; the real id is set on
    // the client during hydration.
    return crypto.randomUUID();
  }
  const existing = sessionStorage.getItem("ll_session_id");
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem("ll_session_id", id);
  return id;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useChatStream({
  figureSlug,
  figureName,
  voiceMode = "modern",
  initialMessages,
  conversationId,
}: UseChatStreamOptions): UseChatStreamResult {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  // Mirror of `messages` for synchronous reads inside send() (state is async).
  const messagesRef = useRef<ChatMessage[]>(initialMessages ?? []);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);

  // Preserved for retry after network error
  const pendingQuestion = useRef<string | null>(null);
  // In-flight guard — only one stream per tab
  const streaming = useRef(false);
  // AbortController for the current in-flight fetch
  const abortRef = useRef<AbortController | null>(null);
  // rAF id for the typing reveal loop
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  // ── Abort + cleanup on unmount or figureSlug change ───────────────────────

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      streaming.current = false;
      // Reset status and clear messages so a slug change mid-stream doesn't
      // leave "typing" stuck and carries a fresh thread to the next figure.
      setStatus("idle");
      setMessages([]);
    };
  }, [figureSlug]);

  // ── Usage fetch ───────────────────────────────────────────────────────────

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch(
        `${ENGINE_URL}/api/usage?figure_slug=${encodeURIComponent(figureSlug)}`
      );
      if (!res.ok) return;
      const body = (await res.json()) as {
        questions_used: number;
        questions_limit: number | null;
      };
      // questions_limit is null for unlimited (pro) users — keep remaining
      // as null so the counter hides rather than showing a negative/NaN value.
      if (typeof body.questions_limit !== "number") return;
      setLimit(body.questions_limit);
      setRemaining(body.questions_limit - body.questions_used);
    } catch {
      // Non-critical; leave remaining as-is
    }
  }, [figureSlug]);

  // ── Typing reveal ─────────────────────────────────────────────────────────

  const startReveal = useCallback(
    (acc: StreamAccumulator, name: string) => {
      setStatus("typing");
      let offset = 0;
      let revealed = "";

      const tick = () => {
        const { slice, nextOffset, done } = chunkRevealSlice(
          acc.fullText,
          offset,
          CHARS_PER_FRAME
        );
        revealed += slice;
        offset = nextOffset;

        setMessages((prev) => {
          // Replace last figure message with updated revealed text
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === "figure") {
            updated[updated.length - 1] = { ...last, text: revealed };
          }
          return updated;
        });

        if (!done) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
          // Commit final state with all metadata
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role === "figure") {
              updated[updated.length - 1] = {
                ...last,
                text: acc.fullText,
                citations: acc.pendingCitations,
                confidence: acc.pendingConfidence,
                contextChip: acc.contextChip ?? undefined,
                sourceWarning: acc.sourceWarning ?? undefined,
                tier3Warning: acc.tier3Warning ?? undefined,
                tier3Sources: acc.tier3Sources.length > 0 ? acc.tier3Sources : undefined,
                refusalContext: acc.refusalContext ?? undefined,
                truncated: acc.truncated || undefined,
              };
            }
            return updated;
          });
          setStatus("complete");
          streaming.current = false;
          pendingQuestion.current = null;
          void fetchUsage();
        }
      };

      // Seed an empty figure message before first tick
      setMessages((prev) => [
        ...prev,
        { role: "figure", figureName: name, text: "" } as ChatMessage,
      ]);
      rafRef.current = requestAnimationFrame(tick);
    },
    [fetchUsage]
  );

  // ── Core send ─────────────────────────────────────────────────────────────

  const send = useCallback(
    async (question: string) => {
      if (streaming.current) return;
      streaming.current = true;
      pendingQuestion.current = question;

      // Snapshot the prior, fully-revealed turns BEFORE appending this question.
      const history = messagesRef.current
        .filter((m) => m.text.trim().length > 0)
        .slice(-MAX_HISTORY_TURNS)
        .map((m) => ({
          role: m.role === "figure" ? ("assistant" as const) : ("user" as const),
          content: m.text,
        }));

      // Append the user message
      setMessages((prev) => [...prev, { role: "user", text: question }]);
      setStatus("consulting");

      // Create the AbortController BEFORE any await so a concurrent slug
      // change can cancel this stream even during the auth round-trip.
      const controller = new AbortController();
      abortRef.current = controller;

      // Resolve JWT for authenticated users (anonymous → no header)
      let jwt: string | null = null;
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        jwt = session?.access_token ?? null;
      } catch {
        // Auth failure is non-fatal; proceed anonymously
      }

      // If the slug changed while we were awaiting the session, bail out.
      if (controller.signal.aborted) {
        streaming.current = false;
        setStatus("idle");
        return;
      }

      const sessionId = getSessionId();

      let res: Response;
      try {
        res = await fetch(`${ENGINE_URL}/api/chat`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
          },
          body: JSON.stringify({
            figure_slug: figureSlug,
            question,
            session_id: sessionId,
            voice_mode: voiceMode,
            history,
            ...(conversationId ? { conversation_id: conversationId } : {}),
          }),
        });
      } catch (err) {
        streaming.current = false;
        abortRef.current = null;
        // Abort is intentional — reset to idle silently, do not set error
        if (err instanceof Error && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        setStatus("error");
        return;
      }

      // ── HTTP error handling ──────────────────────────────────────────────

      if (!res.ok) {
        streaming.current = false;
        abortRef.current = null;

        if (res.status === 429) {
          let detail = "Daily question limit reached.";
          try {
            const body = (await res.json()) as { detail?: string };
            if (body.detail) detail = body.detail;
          } catch {
            /* ignore */
          }
          setStatus({ kind: "limited", detail });
          return;
        }

        if (res.status === 409) {
          setStatus({
            kind: "blocked",
            message:
              "This figure's library isn't ready yet. Please check back soon.",
          });
          return;
        }

        setStatus("error");
        return;
      }

      // ── Stream processing ────────────────────────────────────────────────

      const reader = res.body?.getReader();
      if (!reader) {
        streaming.current = false;
        abortRef.current = null;
        setStatus("error");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let acc: StreamAccumulator = makeChatState();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const { events, rest } = parseSSEChunk(buffer);
          buffer = rest;

          for (const event of events) {
            acc = applyEvent(acc, event);
          }

          if (acc.readyToReveal) break;
        }
        // Flush any bytes held in the decoder
        buffer += decoder.decode();
      } catch (err) {
        streaming.current = false;
        abortRef.current = null;
        try { reader.cancel(); } catch { /* ignore */ }
        // Abort is intentional — reset to idle silently
        if (err instanceof Error && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        setStatus("error");
        return;
      } finally {
        try {
          reader.cancel();
        } catch {
          /* ignore */
        }
      }

      abortRef.current = null;

      // If the stream closed without a `done` event, the response was truncated.
      if (!acc.readyToReveal) {
        streaming.current = false;
        // Preserve pendingQuestion so retry() can re-send
        setStatus("error");
        return;
      }

      // Hand off to the typing reveal animation
      startReveal(acc, figureName);
    },
    [figureSlug, figureName, voiceMode, conversationId, startReveal]
  );

  // ── Retry ─────────────────────────────────────────────────────────────────

  const retry = useCallback(() => {
    // No-op unless we are in the error state and not already streaming
    if (streaming.current) return;
    if (status !== "error") return;
    const q = pendingQuestion.current;
    if (!q) return;
    // Remove the last user message (which failed) before re-sending
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      return last?.role === "user" ? prev.slice(0, -1) : prev;
    });
    void send(q);
  }, [send, status]);

  // ── Continue truncated answer ──────────────────────────────────────────────

  const continueAnswer = useCallback(() => {
    send(CONTINUE_PROMPT);
  }, [send]);

  // ── Regenerate / edit-and-resend ──────────────────────────────────────────

  const resendFrom = useCallback(
    (question: string) => {
      if (streaming.current) return;
      // Drop trailing messages back to (and including) the last user turn.
      const prev = messagesRef.current;
      let cut = prev.length;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === "user") { cut = i; break; }
      }
      if (cut === prev.length) return; // no prior user turn to replace; nothing to resend
      const trimmed = prev.slice(0, cut);
      messagesRef.current = trimmed;   // sync mirror so send() snapshots correct history
      setMessages(trimmed);
      send(question);
    },
    [send]
  );

  const regenerate = useCallback(() => {
    const prev = messagesRef.current;
    const lastUser = [...prev].reverse().find((m) => m.role === "user");
    if (lastUser) resendFrom(lastUser.text);
  }, [resendFrom]);

  const editLast = useCallback((newText: string) => {
    if (newText.trim().length === 0) return;
    resendFrom(newText.trim());
  }, [resendFrom]);

  // ── Derived convenience fields ────────────────────────────────────────────

  const limitDetail =
    typeof status === "object" && status.kind === "limited"
      ? status.detail
      : null;

  return { messages, status, remaining, limit, limitDetail, send, retry, continueAnswer, regenerate, editLast };
}
