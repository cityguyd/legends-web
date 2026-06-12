"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AskBarFigure {
  slug: string;
  name: string;
}

/**
 * Dashboard ask input — picks a live figure and routes to /chat/[slug]?q=.
 * The question only prefills the composer there; it is never auto-sent.
 */
export function AskBar({ figures }: { figures: AskBarFigure[] }) {
  const router = useRouter();
  const [slug, setSlug] = useState(figures[0]?.slug ?? "");
  const [question, setQuestion] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!slug) return;
    const q = question.trim();
    router.push(`/chat/${slug}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  }

  if (figures.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-sub">
        No figures are live yet — check back soon.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center"
    >
      <select
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        aria-label="Choose a figure"
        className="rounded-full border border-border bg-bg px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/50"
      >
        {figures.map((figure) => (
          <option key={figure.slug} value={figure.slug}>
            {figure.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ask any question…"
        aria-label="Your question"
        className="min-w-0 flex-1 rounded-full border border-border bg-bg px-4 py-2.5 text-sm text-ink placeholder:text-sub/70 focus:outline-none focus:ring-2 focus:ring-gold/50"
      />
      <button
        type="submit"
        className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
      >
        Ask
      </button>
    </form>
  );
}
