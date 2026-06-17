"use client";

import { useState } from "react";
import { suggestSource } from "@/lib/actions/suggestSource";

type FormState = "idle" | "submitting" | "done" | "error";

/**
 * Inline "Know a source we missed?" capture, shown on refusal cards.
 *
 * A refusal means no source in our library addressed the question. This invites
 * the reader to point us at one (a link or a description) so we can review it
 * for the corpus later. The figure and the original question are submitted
 * automatically; the email is optional.
 */
export function SourceSuggestionForm({
  figureSlug,
  question,
}: {
  figureSlug: string;
  question?: string;
}) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!source.trim() || state === "submitting") return;
    setState("submitting");
    try {
      await suggestSource(figureSlug, question ?? "", source, email);
      setState("done");
    } catch {
      // The action only throws on validation/DB errors; show a retry hint.
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-3 border-t border-border/60 pt-3 text-xs text-sub">
        Thank you — we&apos;ll review that source and add it if it fits.
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-border/60 pt-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-gold-dark hover:underline"
        >
          Did we miss a source relevant to this question? Let us know →
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs text-sub">
            Know a source that addresses this? Paste a link or name it and
            we&apos;ll look it up for the library.
          </p>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Paste a link or name the source"
            aria-label="Source link or description"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-sub/70 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional — if you'd like a reply)"
            aria-label="Email (optional)"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink placeholder:text-sub/70 focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!source.trim() || state === "submitting"}
              className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state === "submitting" ? "Sending…" : "Send"}
            </button>
            {state === "error" && (
              <span className="text-xs text-confidence-spec">
                Something went wrong — please try again.
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
