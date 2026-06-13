import Link from "next/link";
import {
  FEATURED_CARDS,
  TRENDING_QUESTIONS,
  cardHref,
} from "@/lib/marketing/homeCards";
import { QUESTION_BACKGROUNDS } from "@/lib/marketing/assets";

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative border-b border-border"
        style={{
          backgroundImage: "url('/images/home-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/40" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <h1 className="font-display text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-6xl">
            Legends Library
          </h1>
          <p className="mt-3 font-display text-xl italic text-amber-200 drop-shadow">
            Hot takes, cold sources.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90 drop-shadow">
            Ask history&apos;s greatest minds about today&apos;s most
            controversial issues. Get bold answers backed by the words they left
            behind.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/figures"
              className="rounded-lg bg-gold px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-gold-dark"
            >
              Ask a Bold Question →
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-lg border border-white/60 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              How It Works
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
              Big questions. Bold answers. Receipts included.
            </p>
          </div>
          <Link
            href="/figures"
            className="shrink-0 text-sm font-semibold text-gold-dark hover:underline"
          >
            View All Figures →
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_CARDS.map((card) => {
            const bgUrl = card.figureSlug ? QUESTION_BACKGROUNDS[card.figureSlug] : undefined;
            return (
              <li
                key={card.question}
                className="relative flex flex-col overflow-hidden rounded-xl border border-border shadow-sm"
                style={bgUrl ? { backgroundImage: `url('${bgUrl}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {bgUrl && <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/40 to-black/60" />}
                <div className={`relative flex flex-col p-5 h-full${bgUrl ? "" : " bg-surface"}`}>
                  <h3 className={`font-display text-lg font-bold leading-snug ${bgUrl ? "text-white" : "text-ink"}`}>
                    {card.question}
                  </h3>
                  <p className={`mt-2 text-xs font-medium uppercase tracking-wide ${bgUrl ? "text-amber-300" : "text-gold-dark"}`}>
                    {card.meta}
                  </p>
                  <div className="mt-auto pt-4">
                    <Link
                      href={cardHref(card)}
                      className={`text-sm font-semibold hover:underline ${bgUrl ? "text-amber-300" : "text-gold-dark"}`}
                    >
                      {card.live ? `Ask ${card.figureShort} →` : "Notify Me →"}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <hr className="divider-gold" />

      {/* Trending strip */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="font-display text-xl font-bold text-ink">
            Hottest Questions Right Now
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {TRENDING_QUESTIONS.map((t) => (
              <li key={t.question}>
                <Link
                  href={cardHref(t)}
                  className="inline-block rounded-full border border-border bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-gold"
                >
                  {t.question}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <hr className="divider-gold" />

      {/* Trust strip */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center">
          <p className="text-sm font-semibold text-ink">Every answer includes:</p>
          <p className="mt-2 text-sm text-sub">
            Primary-source citations · Confidence label · Evidence vs. inference
            notes
          </p>
        </div>
      </section>
    </>
  );
}
