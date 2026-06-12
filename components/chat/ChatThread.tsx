"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStream } from "@/lib/chat/useChatStream";
import { Composer } from "./Composer";
import { ConsultingIndicator } from "./ConsultingIndicator";
import { FigureHeader, type FigureHeaderFigure, type VoiceMode } from "./FigureHeader";
import { ResponseCard } from "./ResponseCard";
import { StatusNotice } from "./StatusNotice";

const FREE_DAILY_SIGNED_IN = 6;
const FREE_DAILY_ANON = 3;

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
  const { messages, status, remaining, send, retry } = useChatStream({
    figureSlug: figure.slug,
    figureName: figure.name,
    voiceMode,
  });

  // Auto-scroll to the newest content
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const busy = status === "consulting" || status === "typing";

  // Pro detection arrives in Task 15/16; until then the counter hides only
  // while remaining is unknown.
  const remainingLabel =
    remaining === null
      ? null
      : isSignedIn
        ? `${remaining} of ${FREE_DAILY_SIGNED_IN} free questions left today`
        : `${remaining} of ${FREE_DAILY_ANON} questions left today`;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <FigureHeader
        figure={figure}
        showVoiceToggle={showVoiceToggle}
        voiceMode={voiceMode}
        onVoiceModeChange={setVoiceMode}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6">
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
              <ResponseCard key={index} message={message} />
            )
          )}

          {status === "consulting" && <ConsultingIndicator />}
          <StatusNotice status={status} onRetry={retry} />
          <div ref={endRef} aria-hidden="true" />
        </div>
      </div>

      <Composer
        onSend={send}
        disabled={busy}
        remainingLabel={remainingLabel}
        initialValue={initialQuestion}
      />
    </div>
  );
}
