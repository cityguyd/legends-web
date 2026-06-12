"use client";

import { useEffect, useRef, useState, useCallback, startTransition } from "react";
import { useChatStream } from "@/lib/chat/useChatStream";
import { Composer } from "./Composer";
import { ConsultingIndicator } from "./ConsultingIndicator";
import { FigureHeader, type FigureHeaderFigure, type VoiceMode } from "./FigureHeader";
import { ResponseCard } from "./ResponseCard";
import { StatusNotice } from "./StatusNotice";
import { LimitModal } from "./LimitModal";

const FREE_DAILY_SIGNED_IN = 6;
const FREE_DAILY_ANON = 3;

/** Pixels of slack at the bottom before we consider the user "unpinned". */
const PINNED_THRESHOLD = 60;

export function ChatThread({
  figure,
  isSignedIn,
  showVoiceToggle,
  initialQuestion,
}: {
  figure: FigureHeaderFigure;
  isSignedIn: boolean;
  showVoiceToggle: boolean;
  /** From ?q= — prefills the composer, never auto-sends. */
  initialQuestion?: string;
}) {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("modern");
  const { messages, status, remaining, limit, send, retry } = useChatStream({
    figureSlug: figure.slug,
    figureName: figure.name,
    voiceMode,
  });

  // LimitModal state — opened when status becomes {kind:"limited"}
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  // Open the limit modal whenever the stream reports a limit hit.
  // startTransition defers the setState call out of the synchronous effect body,
  // satisfying the react-hooks/set-state-in-effect lint rule.
  useEffect(() => {
    if (typeof status === "object" && status.kind === "limited") {
      startTransition(() => setLimitModalOpen(true));
    }
  }, [status]);

  // Auto-scroll: only when the user is "pinned" to the bottom.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true); // start pinned

  // Track whether user has scrolled away from the bottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    pinnedRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= PINNED_THRESHOLD;
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !pinnedRef.current) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, [messages, status]);

  const busy = status === "consulting" || status === "typing";

  // TODO(task-16): replace with real pro detection from Stripe subscription
  // For now: anonymous users are "anonymous", signed-in are "free".
  const copyTier = isSignedIn ? "free" : "anonymous";

  // Determine which limit modal kind to show based on auth state.
  const limitModalKind = isSignedIn ? "free-daily" : "anon-daily";

  // Pro detection arrives in Task 15/16; until then the counter hides only
  // while remaining is unknown.
  // Use the hook's live limit when available, fall back to hardcoded caps.
  const denominator =
    limit !== null ? limit : isSignedIn ? FREE_DAILY_SIGNED_IN : FREE_DAILY_ANON;
  const remainingLabel =
    remaining === null
      ? null
      : isSignedIn
        ? `${remaining} of ${denominator} free questions left today`
        : `${remaining} of ${denominator} questions left today`;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col bg-bg">
        <FigureHeader
          figure={figure}
          showVoiceToggle={showVoiceToggle}
          voiceMode={voiceMode}
          onVoiceModeChange={setVoiceMode}
        />

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.length === 0 && (
              <p className="mt-10 text-center text-sm text-sub">
                Ask {figure.name} anything — every answer is grounded in their
                own words.
              </p>
            )}

            {messages.map((message, index) =>
              message.role === "user" ? (
                <div
                  key={index}
                  className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-bubble px-4 py-2.5 text-sm leading-relaxed text-ink"
                >
                  {message.text}
                </div>
              ) : (
                <ResponseCard key={index} message={message} tier={copyTier} />
              )
            )}

            {status === "consulting" && <ConsultingIndicator />}
            {/* limited status opens LimitModal; StatusNotice handles error/blocked only */}
            <StatusNotice status={status} onRetry={retry} />
          </div>
        </div>

        <Composer
          onSend={send}
          disabled={busy}
          remainingLabel={remainingLabel}
          initialValue={initialQuestion}
        />
      </div>

      <LimitModal
        kind={limitModalKind}
        open={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
      />
    </>
  );
}
