import Link from "next/link";
import { getFeaturedQuestions } from "@/lib/marketing/data";

export const revalidate = 3600;

const FEATURED_COUNT = 5;

export default async function HomePage() {
  const questions = await getFeaturedQuestions();
  const featured = questions.slice(0, FEATURED_COUNT);
  const trending = questions.slice(FEATURED_COUNT, FEATURED_COUNT + 5);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="font-display text-5xl font-bold tracking-tight text-ink md:text-6xl">
            Legends Library
          </h1>
          <p className="mt-3 font-display text-xl italic text-gold-dark">
            Hot takes, cold sources.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-sub">
            Ask the biggest questions of today. Get the takes of history&apos;s
            greatest minds. Backed by their{" "}
            <em className="text-ink">real words</em>, not guesswork.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/figures"
              className="rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Ask a Question →
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:border-gold"
            >
              How it Works
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Hot Takes */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">
              Featured Hot Takes
            </h2>
            <p className="mt-1 text-sub">
              Big questions. Bold perspectives. See what they&apos;d really say.
            </p>
          </div>
          <Link
            href="/figures"
            className="shrink-0 text-sm font-semibold text-gold-dark hover:underline"
          >
            View All Figures →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-surface p-8 text-center text-sub">
            Featured questions are on their way. Check back soon.
          </p>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featured.map((q) => (
              <li
                key={q.slug}
                className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <h3 className="font-display text-lg font-bold leading-snug text-ink">
                  {q.question}
                </h3>
                {q.subtitle && (
                  <p className="mt-2 text-sm italic text-sub">{q.subtitle}</p>
                )}
                {q.figure_name && (
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gold-dark">
                    {q.figure_name}
                  </p>
                )}
                <div className="mt-auto pt-4">
                  <Link
                    href={`/questions/${q.slug}`}
                    className="text-sm font-semibold text-gold-dark hover:underline"
                  >
                    View Analysis →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Trending strip */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="font-display text-xl font-bold text-ink">
            Trending Questions
          </h2>
          <p className="mt-1 text-sm text-sub">
            The questions everyone&apos;s asking right now.
          </p>
          {trending.length === 0 ? (
            <p className="mt-4 text-sm text-sub">
              Nothing trending yet — be the first to ask.
            </p>
          ) : (
            <ul className="mt-4 flex flex-wrap gap-3">
              {trending.map((q) => (
                <li key={q.slug}>
                  <Link
                    href={`/questions/${q.slug}`}
                    className="inline-block rounded-full border border-border bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-gold"
                  >
                    {q.question}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
