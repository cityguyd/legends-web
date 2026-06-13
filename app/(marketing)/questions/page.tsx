import Link from "next/link";
import { getFeaturedQuestions } from "@/lib/marketing/data";

export const revalidate = 3600;

export const metadata = {
  title: "Hot Questions — Legends Library",
  description:
    "Browse source-grounded answers to history's hottest questions — citations and confidence labels included.",
};

export default async function HotQuestionsPage() {
  const questions = await getFeaturedQuestions();

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="text-center">
        <h1 className="font-display text-5xl font-bold text-ink">Hot Questions</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-sub">
          The biggest debates, already argued — with receipts. Browse cached,
          source-grounded answers, then ask your own.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="mt-12 rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-sub">
            Fresh hot takes are being prepared. In the meantime, put a figure on
            the spot yourself.
          </p>
          <Link
            href="/figures"
            className="mt-6 inline-block rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            Ask a Bold Question →
          </Link>
        </div>
      ) : (
        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {questions.map((q) => (
            <li
              key={q.slug}
              className="flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm"
            >
              <Link
                href={`/questions/${q.slug}`}
                className="font-display text-xl font-bold leading-snug text-ink hover:underline"
              >
                {q.question}
              </Link>
              {q.figure_name && (
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gold-dark">
                  {q.figure_name}
                </p>
              )}
              <div className="mt-auto pt-4">
                <Link
                  href={`/questions/${q.slug}`}
                  className="text-sm font-semibold text-gold-dark hover:underline"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  View Analysis →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
