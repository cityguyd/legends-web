import type { ReactNode } from "react";

/**
 * Minimal markdown renderer for trusted, locally authored content
 * (legal pages). Supports #/##/### headings, paragraphs, unordered
 * lists, **bold**, and *italic*. Not for untrusted input.
 */

function renderInline(text: string): ReactNode[] {
  // Split on **bold** first, then *italic* within the remainder.
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return [<strong key={`b${i}`}>{part.slice(2, -2)}</strong>];
    }
    return part.split(/(\*[^*]+\*)/g).map((sub, j) => {
      if (sub.startsWith("*") && sub.endsWith("*") && sub.length > 2) {
        return <em key={`i${i}-${j}`}>{sub.slice(1, -1)}</em>;
      }
      return sub;
    });
  });
}

export function Markdown({ source }: { source: string }) {
  const blocks = source
    .split(/\r?\n\r?\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <>
      {blocks.map((block, i) => {
        const heading = block.match(/^(#{1,3})\s+(.*)$/);
        if (heading) {
          const text = renderInline(heading[2]);
          if (heading[1].length === 1) {
            return (
              <h1
                key={i}
                className="font-display text-4xl font-bold text-ink"
              >
                {text}
              </h1>
            );
          }
          if (heading[1].length === 2) {
            return (
              <h2
                key={i}
                className="mt-10 font-display text-2xl font-bold text-ink"
              >
                {text}
              </h2>
            );
          }
          return (
            <h3 key={i} className="mt-8 font-display text-xl font-bold text-ink">
              {text}
            </h3>
          );
        }

        const lines = block.split(/\r?\n/);
        if (lines.every((l) => /^[-*]\s+/.test(l))) {
          return (
            <ul key={i} className="mt-4 list-disc space-y-2 pl-6 text-sub">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="mt-4 leading-relaxed text-sub">
            {renderInline(lines.join(" "))}
          </p>
        );
      })}
    </>
  );
}
