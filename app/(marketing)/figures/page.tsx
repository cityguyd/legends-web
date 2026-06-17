import Link from "next/link";
import {
  FAITH_CATEGORY,
  FAITH_LANDING_HREF,
  FigureCard,
} from "@/components/marketing/FigureCard";
import { getFigures } from "@/lib/marketing/data";
import { FIGURE_HEADERS } from "@/lib/marketing/assets";

export const revalidate = 3600;

export const metadata = {
  title: "Figures",
  description:
    "Explore the great thinkers, leaders, and visionaries whose words still shape our world.",
  openGraph: {
    title: 'Figures — Legends Library',
    url: '/figures',
  },
  twitter: { title: 'Figures — Legends Library' },
};

export default async function FiguresPage() {
  const figures = await getFigures();

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[360px] items-start justify-center border-b border-border"
        style={{
          backgroundImage: "url('/images/meet-the-minds.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="relative mx-auto max-w-3xl px-6 pt-10 text-center">
          <h1 className="font-display text-5xl font-bold text-white drop-shadow-lg [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            Meet the Minds
          </h1>
          <p className="mt-3 font-display text-lg italic text-white drop-shadow-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            Where history&apos;s biggest names meet today&apos;s biggest arguments.
          </p>
          <p className="translate-y-30 mx-auto mt-5 max-w-xl text-white drop-shadow-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            Explore the figures whose ideas built movements, nations,
            revolutions, and controversies. Ask them anything — and get
            answers grounded in primary sources.
          </p>
        </div>
      </section>

      {/* Roster */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {figures.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border bg-surface p-10 text-center text-sub">
            The library is being stocked. New figures arrive soon.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {figures.map((figure) => (
              <li key={figure.slug} className="flex">
                <FigureCard
                  figure={{
                    slug: figure.slug,
                    name: figure.name,
                    tagline: figure.tagline,
                    era: figure.era,
                    categories: figure.category,
                    wave: figure.wave,
                    portraitUrl: figure.portrait_url ?? FIGURE_HEADERS[figure.slug] ?? null,
                    shortName: (figure as unknown as Record<string, unknown>).short_name as string | undefined,
                  }}
                  moreInfoHref={
                    figure.category.includes(FAITH_CATEGORY)
                      ? FAITH_LANDING_HREF
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Verified sources strip */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-6 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">
            All Figures. Cold Sources.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sub">
            Every figure in Legends Library is built from a source library:
            speeches, letters, books, interviews, and verified writings. Ask
            the bold question — then check the receipts.
          </p>
          <Link
            href="/how-it-works"
            className="mt-5 inline-block text-sm font-semibold text-gold-dark hover:underline"
          >
            How It Works →
          </Link>
        </div>
      </section>
    </>
  );
}
