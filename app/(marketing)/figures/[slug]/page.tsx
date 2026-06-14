import Link from "next/link";
import { notFound } from "next/navigation";
import { shortName } from "@/components/marketing/FigureCard";
import { SourceCard } from "@/components/marketing/SourceCard";
import { NotifyButton } from "@/components/marketing/NotifyButton";
import {
  getFigureBySlug,
  getFeaturedQuestionsForFigure,
  getSourcesForFigure,
  isLive,
} from "@/lib/marketing/data";
import { FIGURE_HEADERS } from "@/lib/marketing/assets";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const figure = await getFigureBySlug(slug);
  if (!figure) return { title: "Figure not found — Legends Library" };
  return {
    title: `${figure.name} — Legends Library`,
    description:
      figure.tagline ??
      `Ask ${figure.name} anything — answers grounded in their primary sources.`,
  };
}

export default async function FigureProfilePage({ params }: Params) {
  const { slug } = await params;
  const figure = await getFigureBySlug(slug);
  if (!figure) notFound();

  const [sources, takes] = await Promise.all([
    getSourcesForFigure(figure.id),
    getFeaturedQuestionsForFigure(figure.id),
  ]);
  const live = isLive(figure);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mx-auto mb-6 size-32 overflow-hidden rounded-full border-2 border-gold/40 bg-surface">
            {(figure.portrait_url ?? FIGURE_HEADERS[figure.slug]) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={figure.portrait_url ?? FIGURE_HEADERS[figure.slug]}
                alt={`Portrait of ${figure.name}`}
                className="size-full object-cover object-top"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center font-display text-4xl text-gold"
              >
                {figure.name.charAt(0)}
              </span>
            )}
          </div>
          <h1 className="font-display text-5xl font-bold text-ink">
            {figure.name}
          </h1>
          {figure.era && (
            <p className="mt-2 text-lg text-gold-dark">{figure.era}</p>
          )}
          {figure.tagline && (
            <p className="mx-auto mt-4 max-w-xl font-display text-lg italic text-sub">
              {figure.tagline}
            </p>
          )}
          {figure.category.length > 0 && (
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {figure.category.map((category) => (
                <li
                  key={category}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-sub"
                >
                  {category}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8">
            {live ? (
              <Link
                href={`/chat/${figure.slug}`}
                className="inline-block rounded-lg bg-gold px-8 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
              >
                Ask {shortName(figure)}
              </Link>
            ) : (
              <NotifyButton
                label={`Notify me when ${shortName(figure)} arrives`}
                className="rounded-lg border border-border bg-surface px-8 py-3 font-semibold text-sub transition-colors hover:bg-card"
              />
            )}
          </div>
        </div>
      </section>

      {/* Disclosure strip */}
      <div className="border-b border-border bg-bubble">
        <p className="mx-auto max-w-3xl px-6 py-3 text-center text-sm text-sub">
          An AI reconstruction grounded in primary sources — not the real
          person.
        </p>
      </div>

      {/* Source Library */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-ink">
          Source Library
        </h2>
        <p className="mt-1 text-sub">
          Every answer is grounded in these documents — {figure.name}&apos;s
          own words.
        </p>
        {sources.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-surface p-8 text-center text-sub">
            The source library for {figure.name} is being assembled.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => (
              <li key={source.id}>
                <SourceCard source={source} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Featured Takes */}
      {takes.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-display text-3xl font-bold text-ink">
              Featured Takes
            </h2>
            <p className="mt-1 text-sub">
              See how {figure.name} answers today&apos;s biggest questions.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {takes.map((take) => (
                <li
                  key={take.slug}
                  className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <h3 className="font-display text-lg font-bold leading-snug text-ink">
                    {take.question}
                  </h3>
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/questions/${take.slug}`}
                      className="text-sm font-semibold text-gold-dark hover:underline"
                    >
                      View Analysis →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
