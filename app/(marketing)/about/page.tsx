import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "About — Legends Library",
  description:
    "History never stopped talking. We just forgot how to listen.",
};

const timelessQuestions = [
  "What makes a society just?",
  "When should power be resisted?",
  "What does freedom actually require?",
  "How should people live when the world feels unstable?",
  "Which ideas are worth defending — and which ones should be challenged?",
];

const pillars = [
  {
    title: "Evidence First",
    body: "Every answer starts from a source library, not a personality prompt. Speeches, letters, books, interviews, essays, and verified writings come before the AI take.",
  },
  {
    title: "Intellectual Honesty",
    body: "Some answers are direct. Others are inferred. Legends Library is built to show the difference with citations, confidence labels, and evidence notes.",
  },
  {
    title: "Multiple Perspectives",
    body: "History rarely speaks with one voice. Council and Debate modes are designed to show disagreement, contrast, and tension — not flatten every figure into the same modern opinion.",
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
          <p className="mx-auto mt-6 max-w-2xl text-lg text-sub">
            Legends Library lets you ask history&apos;s most influential figures
            about the questions people are still fighting over today — power,
            race, money, war, faith, freedom, technology, and the future.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-sub">
            We are not building fake historical roleplay. We are building the
            most entertaining way to argue with primary sources.
          </p>
        </div>
      </section>

      {/* Why we built this */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-ink">
          Why We Built This
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-sub">
          Every generation asks the same kinds of questions:
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
          Legends Library brings those questions back into conversation with the
          people whose words shaped history.
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
              We are <em className="text-gold-dark">not</em> building fake
              historical roleplay. We are building the most entertaining way to
              argue with primary sources.
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
          We are starting with a small number of figures and expanding
          carefully. New figures are added only after their source libraries are
          reviewed, organized, and prepared for citation-backed answers.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sub">
          Our goal is simple:
        </p>
        <p className="mt-4 font-display text-2xl font-bold text-ink">
          Make history impossible to ignore.
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
