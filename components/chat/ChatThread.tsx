"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStream } from "@/lib/chat/useChatStream";
import { Composer } from "./Composer";
import { ConsultingIndicator } from "./ConsultingIndicator";
import { FigureHeader, type FigureHeaderFigure, type VoiceMode } from "./FigureHeader";
import { ResponseCard } from "./ResponseCard";
import { CopyToast } from "./CopyToast";
import { StatusNotice } from "./StatusNotice";
import { LimitModal } from "./LimitModal";
import { SaveConversationButton } from "./SaveConversationButton";

const FREE_DAILY_SIGNED_IN = 6;
const FREE_DAILY_ANON = 3;

/** Slugs whose refusals use Scripture-flavoured "Outside the Record" copy. */
const FAITH_FIGURE_SLUGS = new Set(["jesus-of-nazareth", "jesus"]);
function isFaithFigure(slug: string): boolean {
  return FAITH_FIGURE_SLUGS.has(slug);
}

/** Pixels of slack at the bottom before we consider the user "unpinned". */
const PINNED_THRESHOLD = 60;

export function ChatThread({
  figure,
  isSignedIn,
  isPro = false,
  showVoiceToggle,
  initialQuestion,
}: {
  figure: FigureHeaderFigure;
  isSignedIn: boolean;
  /** From profiles.tier (server-read) — the only source of truth for access. */
  isPro?: boolean;
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

  // "Ask this" on a refusal card prefills (never auto-sends) the composer.
  const [prefill, setPrefill] = useState<{ value: string; nonce: number } | null>(
    null
  );
  const askAdjacent = useCallback((question: string) => {
    setPrefill((prev) => ({ value: question, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

  // Faith figures decline with "Outside the Record"; historical figures with
  // "Beyond My Time" (they couldn't have known a modern topic).
  const refusalHeading = isFaithFigure(figure.slug)
    ? "Outside the Record"
    : "Beyond My Time";

  // Derived LimitModal state — open whenever status is "limited" and the user
  // hasn't dismissed that specific status object yet.
  // Pro users who hit a 429 (fair-use rate limit) should NOT see the free-daily
  // upsell modal — they already pay. Show an inline notice instead (handled by
  // the StatusNotice branch below).
  const [dismissed, setDismissed] = useState<unknown>(null);
  const limitOpen =
    !isPro &&
    typeof status === "object" &&
    status.kind === "limited" &&
    status !== dismissed;

  // Toast state hoisted here so ONE CopyToast covers all ResponseCards.
  const [toastVisible, setToastVisible] = useState(false);

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

  // Real tier from profiles.tier (set by the Stripe webhook): pro copies
  // clean (no attribution line); free/anonymous get the attribution suffix.
  const copyTier = isPro
    ? ("pro" as const)
    : isSignedIn
      ? ("free" as const)
      : ("anonymous" as const);

  // Determine which limit modal kind to show based on auth state.
  const limitModalKind = isSignedIn ? "free-daily" : "anon-daily";

  // Pro has no daily cap (fair use) — hide the counter entirely.
  // Use the hook's live limit when available, fall back to hardcoded caps.
  const denominator =
    limit !== null ? limit : isSignedIn ? FREE_DAILY_SIGNED_IN : FREE_DAILY_ANON;
  const remainingLabel =
    isPro || remaining === null
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
                <ResponseCard
                  key={index}
                  message={message}
                  tier={copyTier}
                  onCopied={() => setToastVisible(true)}
                  refusalHeading={refusalHeading}
                  onAskAdjacent={askAdjacent}
                  figureSlug={figure.slug}
                  question={
                    messages[index - 1]?.role === "user"
                      ? messages[index - 1].text
                      : undefined
                  }
                />
              )
            )}

            {/* Save affordance — signed-in users with a settled thread */}
            {isSignedIn && messages.length > 0 && !busy && (
              <SaveConversationButton
                figureSlug={figure.slug}
                messages={messages}
              />
            )}

            {status === "consulting" && <ConsultingIndicator />}
            {/* Pro users who hit a fair-use 429 see a neutral inline notice,
                not the free-daily upsell modal. */}
            {isPro &&
              typeof status === "object" &&
              status.kind === "limited" && (
                <div
                  role="status"
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-sub"
                >
                  You&apos;ve reached the fair-use limit for today. Come back
                  tomorrow to continue.
                </div>
              )}
            {/* limited status opens LimitModal (non-pro); StatusNotice handles error/blocked only */}
            <StatusNotice status={status} onRetry={retry} />
          </div>
        </div>

        <Composer
          onSend={send}
          disabled={busy}
          remainingLabel={remainingLabel}
          initialValue={initialQuestion}
          prefill={prefill}
        />
      </div>

      {/* Single toast for all ResponseCards in this thread */}
      <CopyToast
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

      <LimitModal
        kind={limitModalKind}
        open={limitOpen}
        onClose={() => setDismissed(status)}
      />
    </>
  );
}
