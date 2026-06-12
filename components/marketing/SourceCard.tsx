import type { SourceDoc } from "@/lib/marketing/data";

const DOC_TYPE_LABELS: Record<string, string> = {
  letter: "Letter",
  speech: "Speech",
  scripture: "Scripture",
  book: "Book",
  transcript: "Transcript",
  social: "Social media",
};

export function SourceCard({ source }: { source: SourceDoc }) {
  const docType = DOC_TYPE_LABELS[source.doc_type] ?? source.doc_type;
  const publicDomain = source.license === "public_domain";

  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm">
      <h3 className="font-display text-base font-bold leading-snug text-ink">
        {source.doc_title}
      </h3>
      <p className="mt-1 text-sm text-sub">
        {docType}
        {source.year !== null && <> · {source.year}</>}
      </p>
      <div className="mt-auto pt-3">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
            publicDomain
              ? "bg-confidence-doc-bg text-confidence-doc"
              : "bg-confidence-inf-bg text-confidence-inf"
          }`}
        >
          {publicDomain ? "Public domain" : "Licensed"}
        </span>
      </div>
    </article>
  );
}
