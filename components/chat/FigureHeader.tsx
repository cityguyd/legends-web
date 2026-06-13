"use client";

import { FIGURE_HEADERS } from "@/lib/marketing/assets";

export type VoiceMode = "historical" | "modern";

export interface FigureHeaderFigure {
  slug: string;
  name: string;
  era: string | null;
  tagline: string | null;
  portraitUrl: string | null;
}

const VOICE_OPTIONS: { mode: VoiceMode; label: string }[] = [
  { mode: "historical", label: "Period voice" },
  { mode: "modern", label: "Modern voice" },
];

export function FigureHeader({
  figure,
  showVoiceToggle,
  voiceMode,
  onVoiceModeChange,
}: {
  figure: FigureHeaderFigure;
  /** Hidden for contemporary figures — no period voice to reconstruct. */
  showVoiceToggle: boolean;
  voiceMode: VoiceMode;
  onVoiceModeChange: (mode: VoiceMode) => void;
}) {
  const bgUrl = FIGURE_HEADERS[figure.slug];

  return (
    <header
      className="relative border-b border-border bg-surface"
      style={
        bgUrl
          ? {
              backgroundImage: `url('${bgUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }
          : undefined
      }
    >
      {bgUrl && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      )}

      <div className="relative">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <div className="size-11 shrink-0 overflow-hidden rounded-full border-2 border-gold/40 bg-card">
            {figure.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={figure.portraitUrl}
                alt={`Portrait of ${figure.name}`}
                className="size-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center font-display text-lg text-gold"
              >
                {figure.name.charAt(0)}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1
              className={`truncate font-display text-lg font-bold leading-tight ${bgUrl ? "text-white" : "text-ink"}`}
            >
              {figure.name}
            </h1>
            <p className="truncate text-xs text-sub">
              {figure.era && (
                <span className={bgUrl ? "text-amber-200" : "text-gold-dark"}>
                  {figure.era}
                </span>
              )}
              {figure.era && figure.tagline && (
                <span aria-hidden="true"> · </span>
              )}
              <span className={bgUrl ? "text-amber-200" : ""}>{figure.tagline}</span>
            </p>
          </div>

          {showVoiceToggle && (
            <div
              role="group"
              aria-label="Voice mode"
              className="flex shrink-0 overflow-hidden rounded-lg border border-border"
            >
              {VOICE_OPTIONS.map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={voiceMode === mode}
                  onClick={() => onVoiceModeChange(mode)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    voiceMode === mode
                      ? "bg-gold text-white"
                      : "bg-surface text-sub hover:text-gold-dark"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Persistent disclosure strip */}
        <div className="border-t border-border bg-bubble/80">
          <p
            className={`mx-auto max-w-3xl px-4 py-1.5 text-center text-xs ${bgUrl ? "text-amber-200" : "text-sub"}`}
          >
            An AI reconstruction grounded in primary sources — not the real
            person.
          </p>
        </div>
      </div>
    </header>
  );
}
