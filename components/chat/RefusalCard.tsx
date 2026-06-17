import type { RefusalContext } from "@/lib/chat/chatReducer";
import { SourceSuggestionForm } from "./SourceSuggestionForm";

/**
 * Premium refusal card (WS3 — "Make refusals feel premium, not broken").
 *
 * Renders an honest, structured refusal: the figure's in-character decline,
 * the sources we actually checked (signalling effort, not failure), and a
 * related question the figure CAN answer. Deliberately avoids the words
 * "error", "failed", "can't", and "Refused" in its chrome — the heading
 * ("Outside the Record" / "Beyond My Time") carries the meaning instead.
 */
export function RefusalCard({
  heading,
  body,
  context,
  onAskAdjacent,
  figureSlug,
  question,
}: {
  heading: string;
  body: string;
  context?: RefusalContext;
  onAskAdjacent?: (question: string) => void;
  /** Figure + question are submitted with a "source we missed" suggestion. */
  figureSlug?: string;
  question?: string;
}) {
  const sources = context?.sourcesChecked ?? [];
  const adjacent = context?.adjacentQuestion ?? null;

  return (
    <div className="mt-2 rounded-lg border border-gold/30 bg-bubble/40 px-4 py-3">
      <p className="flex items-center gap-2 font-display text-sm font-bold text-ink">
        <span
          aria-hidden="true"
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-confidence-spec-bg text-confidence-spec"
        >
          ✕
        </span>
        {heading}
      </p>

      <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">{body}</p>

      {sources.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
            Sources I checked
          </p>
          <ul className="mt-1 space-y-0.5 text-sm text-sub">
            {sources.map((source, index) => (
              <li key={`${source.title}-${index}`}>
                <span aria-hidden="true">· </span>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-dark hover:underline"
                  >
                    {source.title}
                  </a>
                ) : (
                  source.title
                )}
                {source.year != null && (
                  <span className="text-sub/70"> ({source.year})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {adjacent && (
        <div className="mt-3 border-t border-border/60 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
            A question I can answer
          </p>
          <p className="mt-1 text-sm italic text-ink">“{adjacent}”</p>
          {onAskAdjacent && (
            <button
              type="button"
              onClick={() => onAskAdjacent(adjacent)}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              → Ask this
            </button>
          )}
        </div>
      )}

      {figureSlug && (
        <SourceSuggestionForm figureSlug={figureSlug} question={question} />
      )}
    </div>
  );
}
