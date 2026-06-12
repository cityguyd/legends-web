import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "About — Legends Library",
  description:
    "History never stopped talking. We just forgot how to listen.",
};

const timelessQuestions = [
  "How should power be used?",
  "What makes a just society?",
  "What is freedom?",
  "When is war justified?",
  "How should technology change our lives?",
];

const pillars = [
  {
    title: "Evidence First",
    body: "Every answer begins with primary sources.",
  },
  {
    title: "Intellectual Honesty",
    body: "We separate evidence from inference.",
  },
  {
    title: "Multiple Perspectives",
    body: "History rarely speaks with one voice.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="font-display text-5xl font-bold leading-tight text-ink">
            About Legends Library
          </h1>
          <p className="mt-4 font-display text-lg italic text-gold-dark">
            History never stopped talking.
            <br />
            We just forgot how to listen.
          </p>
        </div>
      </section>

      {/* Why we built this */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">
          Why We Built This
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-sub">
          Most people encounter history as a collection of dates, names, and
          events. We think history is far more interesting than that. The
          people who shaped the world wrestled with many of the same questions
          we face today:
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-3">
          {timelessQuestions.map((q) => (
            <li
              key={q}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-ink"
            >
              {q}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sub">
          Legends Library exists to reconnect modern questions with historical
          wisdom.
        </p>
      </section>

      {/* What makes us different */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center font-display text-3xl font-bold text-ink">
            What Makes Us Different
          </h2>
          <div className="mt-10 grid gap-8 text-center md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title}>
                <h3 className="font-display text-xl font-bold text-gold-dark">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sub">{pillar.body}</p>
              </div>
            ))}
          </div>

          <blockquote className="mx-auto mt-14 max-w-2xl rounded-xl border border-border bg-card px-8 py-10 text-center">
            <p className="font-display text-2xl font-bold leading-snug text-ink">
              We are <em className="text-gold-dark">not</em> building AI
              roleplay. We are building a primary-source engine for
              understanding how great thinkers might reason about today&apos;s
              world.
            </p>
          </blockquote>
        </div>
      </section>

      {/* The library is growing */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">
          The Library Is Growing
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sub">
          New voices are continually added as new source libraries are
          completed.
        </p>
        <Link
          href="/figures"
          className="mt-6 inline-block text-sm font-semibold text-gold-dark hover:underline"
        >
          See Who&apos;s in the Library →
        </Link>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-ink">
            Hot takes. Cold sources.
          </h2>
          <p className="mt-4 text-sub">
            The internet has plenty of opinions. We&apos;re interested in
            evidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/figures"
              className="rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Browse Figures →
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:border-gold"
            >
              How it Works →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
