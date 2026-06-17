"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TypewriterAnswerProps {
  text: string;
  figureSlug: string;
  figureName: string;
  portraitUrl?: string | null;
  confidence?: string;
  citationsCount?: number;
}

const CHAR_DELAY_MS = 12;

export function TypewriterAnswer({
  text,
  figureSlug,
  figureName,
  portraitUrl,
  confidence,
  citationsCount,
}: TypewriterAnswerProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const indexRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    setDone(false);

    const interval = setInterval(() => {
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
        return;
      }
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
    }, CHAR_DELAY_MS);

    return () => clearInterval(interval);
  }, [text]);

  function handleFollowUp(e: React.FormEvent) {
    e.preventDefault();
    const q = followUp.trim();
    if (!q) return;
    router.push(`/chat/${figureSlug}?q=${encodeURIComponent(q)}`);
  }

  return (
    <div>
      {/* Figure attribution row */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-gold/40 bg-card">
          {portraitUrl ? (
            <Image
              src={portraitUrl}
              alt={`Portrait of ${figureName}`}
              width={48}
              height={48}
              className="size-full object-cover object-top"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-full items-center justify-center font-display text-xl text-gold"
            >
              {figureName.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <Link
            href={`/figures/${figureSlug}`}
            className="font-display text-lg font-bold text-ink hover:text-gold-dark"
          >
            {figureName}
          </Link>
          <p className="text-xs text-sub">
            AI reconstruction · Primary-source grounded
            {confidence ? ` · Confidence: ${confidence}` : ""}
          </p>
        </div>
      </div>

      {/* Animated answer text */}
      <div className="mt-4 leading-relaxed text-ink whitespace-pre-wrap">
        {displayed}
        {!done && (
          <span className="inline-block w-0.5 h-4 bg-gold ml-0.5 animate-pulse align-text-bottom" />
        )}
      </div>

      {citationsCount !== undefined && citationsCount > 0 && (
        <p className="mt-4 text-sm text-sub border-t border-border pt-3">
          Verified against {citationsCount}{" "}
          {citationsCount === 1 ? "source" : "sources"}
        </p>
      )}

      {/* Follow-up composer — appears after animation completes */}
      {done && (
        <form
          onSubmit={handleFollowUp}
          className="mt-6 flex gap-2 border-t border-border pt-5"
        >
          <input
            type="text"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder={`Ask ${figureName.split(" ")[0]} a follow-up…`}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-sub focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={!followUp.trim()}
            className="rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:opacity-40"
          >
            Ask →
          </button>
        </form>
      )}
    </div>
  );
}
