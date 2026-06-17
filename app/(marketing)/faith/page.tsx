import Link from "next/link";
import { FigureCard } from "@/components/marketing/FigureCard";
import { SourceCard } from "@/components/marketing/SourceCard";
import { getFigureBySlug, getSourcesForFigure } from "@/lib/marketing/data";
import { FIGURE_HEADERS } from "@/lib/marketing/assets";

export const revalidate = 3600;

const JESUS_SLUG = "jesus-of-nazareth";

export const metadata = {
  title: "Christian Faith — Ask Jesus from the Gospels",
  description:
    "Ask Jesus your question and get the answer drawn from the Gospels — with the chapter and verse. Not paraphrase. Not hallucination. The actual text of Scripture.",
  openGraph: {
    title: "Christian Faith — Legends Library",
    description:
      "Every answer drawn from the Gospels, with the verse. Not paraphrase. Not hallucination. The actual text.",
    url: "/faith",
  },
  twitter: { title: "Christian Faith — Legends Library" },
};

// Faith confidence tiers — the same engine tiers, named in Scripture's language.
const FAITH_TIERS: { label: string; body: string; tone: string }[] = [
  {
    label: "Documented in Scripture",
    body: "The answer is grounded in His recorded words — quoted, with the chapter and verse.",
    tone: "bg-confidence-doc-bg text-confidence-doc",
  },
  {
    label: "Inferred from Teaching",
    body: "Scripture doesn't address it head-on, so the answer reasons from what is written — and says so.",
    tone: "bg-confidence-inf-bg text-confidence-inf",
  },
  {
    label: "Outside the Record",
    body: "The Gospels don't speak to it. We won't speculate beyond the text — we'll tell you so plainly.",
    tone: "bg-bubble text-sub",
  },
];

// Popular Christian figures on the roadmap — rendered as static "Coming Soon"
// cards (not yet seeded in the DB, so no live notify hook).
const COMING_SOON_FAITH: { name: string; era: string; note: string }[] = [
  { name: "The Apostle Paul", era: "c. 5 – c. 65 AD", note: "The Epistles — letters that built the early Church." },
  { name: "Augustine of Hippo", era: "354 – 430", note: "Confessions and City of God." },
  { name: "Thomas Aquinas", era: "1225 – 1274", note: "The Summa Theologica." },
  { name: "Martin Luther", era: "1483 – 1546", note: "The Reformation, in his own words." },
  { name: "John Wesley", era: "1703 – 1791", note: "Sermons and journals of the Methodist revival." },
  { name: "C. S. Lewis", era: "1898 – 1963", note: "Mere Christianity and the apologetics." },
];

export default async function FaithPage() {
  const jesus = await getFigureBySlug(JESUS_SLUG);
  const sources = jesus ? await getSourcesForFigure(jesus.id) : [];
  // Scripture first — this is a faith page; the Gospels lead, background reading follows.
  const sortedSources = [...sources].sort((a, b) => {
    const score = (t: string) => (t === "scripture" ? 0 : 1);
    return score(a.doc_type) - score(b.doc_type);
  });
  const scriptureCount = sources.filter((s) => s.doc_type === "scripture").length;

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-[360px] items-start justify-center border-b border-border"
        style={{
          backgroundImage: "url('/images/faith-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
        }}
      >
        <div className="relative mx-auto max-w-3xl px-6 pt-10 text-center">
          <p className="font-display text-lg italic text-amber-200 drop-shadow-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            Christian Faith
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold text-white drop-shadow-lg [text-shadow:0_2px_10px_rgba(0,0,0,0.85)] md:text-5xl">
            Ask Jesus — from the Gospels
          </h1>
          <p className="translate-y-24 mx-auto mt-4 max-w-xl text-white drop-shadow-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            Every answer is drawn from the Gospels, with the verse. Not
            paraphrase. Not hallucination. The actual text of Scripture.
          </p>
          <div className="translate-y-24 mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`/chat/${JESUS_SLUG}`}
              className="rounded-lg bg-gold px-7 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-gold-dark"
            >
              Ask Jesus →
            </Link>
            <Link
              href="#sources"
              className="rounded-lg border border-white/40 bg-black/30 px-7 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/45"
            >
              See the Sources
            </Link>
          </div>
        </div>
      </section>

      {/* The promise */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">
          Scripture, quoted — not invented
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-sub">
          Most AI will happily put words in Jesus&apos;s mouth. We won&apos;t.
          Every response is built from the actual text of the Gospels and
          retrieved chapter-and-verse, so you can read the source for yourself.
          When Scripture is silent, the answer says so — it never fills the gap
          with a guess.
        </p>
        <ul className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {FAITH_TIERS.map((tier) => (
            <li
              key={tier.label}
              className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <span
                className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${tier.tone}`}
              >
                {tier.label}
              </span>
              <p className="mt-3 text-sm leading-snug text-sub">{tier.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <hr className="divider-gold" />

      {/* Ask Jesus + coming soon roster */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-3xl font-bold text-ink">
            Voices of the Faith
          </h2>
          <p className="mt-1 text-sub">
            Start with Jesus, in His own recorded words. More of the great
            Christian voices are on the way.
          </p>

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {jesus && (
              <li className="flex">
                <FigureCard
                  figure={{
                    slug: jesus.slug,
                    name: jesus.name,
                    tagline: jesus.tagline,
                    era: jesus.era,
                    categories: jesus.category,
                    wave: jesus.wave,
                    portraitUrl:
                      jesus.portrait_url ?? FIGURE_HEADERS[jesus.slug] ?? null,
                  }}
                  // On the faith page itself, "More Info" goes to the full
                  // profile rather than looping back here.
                  moreInfoHref={`/figures/${jesus.slug}`}
                />
              </li>
            )}

            {COMING_SOON_FAITH.map((figure) => (
              <li key={figure.name} className="flex">
                <article className="relative flex h-full w-full flex-col rounded-xl border border-border bg-surface p-5 text-center shadow-sm">
                  <span className="absolute right-3 top-3 rounded-full bg-bubble px-2.5 py-0.5 text-xs font-medium text-sub">
                    Coming Soon
                  </span>
                  <div className="mx-auto mb-4 size-28 overflow-hidden rounded-full border-2 border-gold/40 bg-card">
                    <span
                      aria-hidden="true"
                      className="flex size-full items-center justify-center font-display text-2xl text-gold opacity-60"
                    >
                      {figure.name.replace(/^The /, "").charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {figure.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-gold-dark">{figure.era}</p>
                  <p className="mt-2 text-sm leading-snug text-sub">
                    {figure.note}
                  </p>
                </article>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-sm text-sub">
            Want a voice added to the library?{" "}
            <Link
              href="/signup"
              className="font-semibold text-gold-dark hover:underline"
            >
              Sign up free
            </Link>{" "}
            and we&apos;ll tell you when they arrive.
          </p>
        </div>
      </section>

      <hr className="divider-gold" />

      {/* Christian sources */}
      <section id="sources" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-bold text-ink">
          The Christian Source Library
        </h2>
        <p className="mt-1 max-w-2xl text-sub">
          {scriptureCount > 0 ? (
            <>
              {scriptureCount} book{scriptureCount === 1 ? "" : "s"} of
              Scripture and supporting texts — every answer is grounded here and
              cited down to the verse.
            </>
          ) : (
            <>The source library is being assembled.</>
          )}
        </p>
        {sortedSources.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-surface p-8 text-center text-sub">
            The Christian source library is being assembled.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedSources.map((source) => (
              <li key={source.id}>
                <SourceCard source={source} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Use case + theological-soundness FAQ */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-center font-display text-2xl font-bold text-ink">
            Used in Sunday school, small groups, and personal devotion
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sub">
            Ask the question your pastor didn&apos;t have time for — and bring
            the verse to your group with confidence.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="font-display text-lg font-bold text-ink">
                Is this theologically sound?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-sub">
                It quotes Scripture rather than interpreting it for you. Answers
                are retrieved from the Gospels and cited, marked as documented,
                inferred, or outside the record. It is a study tool, not a
                pulpit — and it&apos;s honest about the difference.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="font-display text-lg font-bold text-ink">
                Is this the real Jesus?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-sub">
                No. It is an AI reconstruction grounded in the recorded text —
                not a person, and not a substitute for Scripture, prayer, or
                your church. Every answer points you back to the source so you
                can read it yourself.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={`/chat/${JESUS_SLUG}`}
              className="rounded-lg bg-gold px-7 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Ask Jesus →
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-lg border border-border bg-surface px-7 py-3 font-semibold text-ink transition-colors hover:border-gold"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Disclosure */}
      <div className="border-t border-border bg-bubble">
        <p className="mx-auto max-w-3xl px-6 py-3 text-center text-sm text-sub">
          An AI reconstruction grounded in primary sources — not the real
          person, and not a substitute for Scripture.
        </p>
      </div>
    </>
  );
}
