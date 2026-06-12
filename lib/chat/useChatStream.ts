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

import { useCallback, useRef, useState } from "react";
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
  StreamAccumulator,
} from "./chatReducer";

// Re-export types the UI layer needs
export type { ChatMessage, ChatStatus, Citation, ConfidenceTier };

// ── Public hook interface ────────────────────────────────────────────────────

export interface UseChatStreamOptions {
  /** figure_slug sent to the engine */
  figureSlug: string;
  /** Display name shown in figure messages (used by Task 13 UI) */
  figureName: string;
  /** voice_mode forwarded to engine; defaults to "modern" */
  voiceMode?: string;
}

export interface UseChatStreamResult {
  messages: ChatMessage[];
  status: ChatStatus;
  /** Remaining daily free questions (null while unknown) */
  remaining: number | null;
  /** Limit detail string on 429 (shown by Task 14 modal) */
  limitDetail: string | null;
  send: (question: string) => void;
  retry: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

const CHARS_PER_FRAME = 40;
const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL ?? "";

export function useChatStream({
  figureSlug,
  figureName,
  voiceMode = "modern",
}: UseChatStreamOptions): UseChatStreamResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limitDetail, setLimitDetail] = useState<string | null>(null);

  // Preserved for retry after network error
  const pendingQuestion = useRef<string | null>(null);
  // In-flight guard — only one stream per tab
  const streaming = useRef(false);

  // ── Usage fetch ───────────────────────────────────────────────────────────

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch(
        `${ENGINE_URL}/api/usage?figure_slug=${encodeURIComponent(figureSlug)}`
      );
      if (!res.ok) return;
      const body = (await res.json()) as {
        questions_used: number;
        questions_limit: number;
      };
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
          requestAnimationFrame(tick);
        } else {
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
              };
            }
            return updated;
          });
          setStatus("complete");
          streaming.current = false;
          void fetchUsage();
        }
      };

      // Seed an empty figure message before first tick
      setMessages((prev) => [
        ...prev,
        { role: "figure", figureName: name, text: "" } as ChatMessage,
      ]);
      requestAnimationFrame(tick);
    },
    [fetchUsage]
  );

  // ── Core send ─────────────────────────────────────────────────────────────

  const send = useCallback(
    async (question: string) => {
      if (streaming.current) return;
      streaming.current = true;
      pendingQuestion.current = question;
      setLimitDetail(null);

      // Append the user message
      setMessages((prev) => [...prev, { role: "user", text: question }]);
      setStatus("consulting");

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

      // Build a stable session_id for this browser tab
      const sessionId =
        typeof window !== "undefined"
          ? (sessionStorage.getItem("ll_session_id") ??
            (() => {
              const id = crypto.randomUUID();
              sessionStorage.setItem("ll_session_id", id);
              return id;
            })())
          : "ssr";

      let res: Response;
      try {
        res = await fetch(`${ENGINE_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
          },
          body: JSON.stringify({
            figure_slug: figureSlug,
            question,
            session_id: sessionId,
            voice_mode: voiceMode,
          }),
        });
      } catch {
        streaming.current = false;
        setStatus("error");
        return;
      }

      // ── HTTP error handling ──────────────────────────────────────────────

      if (!res.ok) {
        streaming.current = false;

        if (res.status === 429) {
          let detail = "Daily question limit reached.";
          try {
            const body = (await res.json()) as { detail?: string };
            if (body.detail) detail = body.detail;
          } catch {
            /* ignore */
          }
          setLimitDetail(detail);
          setStatus({ kind: "limited", detail });
          return;
        }

        if (res.status === 409) {
          setStatus({
            kind: "blocked",
            category:
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
      } catch {
        streaming.current = false;
        setStatus("error");
        return;
      } finally {
        try {
          reader.cancel();
        } catch {
          /* ignore */
        }
      }

      // Hand off to the typing reveal animation
      startReveal(acc, figureName);
    },
    [figureSlug, figureName, voiceMode, startReveal]
  );

  // ── Retry ─────────────────────────────────────────────────────────────────

  const retry = useCallback(() => {
    if (pendingQuestion.current) {
      // Remove the last user message (which failed) before re-sending
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return last?.role === "user" ? prev.slice(0, -1) : prev;
      });
      void send(pendingQuestion.current);
    }
  }, [send]);

  return { messages, status, remaining, limitDetail, send, retry };
}
