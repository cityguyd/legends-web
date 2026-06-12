import { EvidenceRow, type EvidenceCitation } from "./EvidenceRow";

/**
 * Message shape rendered by the card. Structurally compatible with the hook's
 * ChatMessage (lib/chat/chatReducer.ts) — extra fields like `role` are ignored.
 */
export interface ResponseCardMessage {
  figureName?: string;
  text: string;
  citations?: EvidenceCitation[];
  confidence?: string;
  contextChip?: string;
}

export function ResponseCard({ message }: { message: ResponseCardMessage }) {
  return (
    <article className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {message.figureName && (
          <h3 className="font-display text-lg font-bold text-ink">
            {message.figureName}
          </h3>
        )}
        {message.contextChip && (
          <span className="rounded-full bg-bubble px-2.5 py-0.5 text-xs text-sub">
            {message.contextChip}
          </span>
        )}
      </header>
      <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink">
        {message.text}
      </p>
      <EvidenceRow confidence={message.confidence} citations={message.citations} />
    </article>
  );
}
