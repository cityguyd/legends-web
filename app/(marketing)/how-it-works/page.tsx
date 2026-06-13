import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "How it Works — Legends Library",
  description:
    "We don't put words in dead people's mouths. We find the words they already said.",
};

const differentiators = [
  {
    heading: "We Don’t Make History Talk from Thin Air",
    body: "Every answer begins with a source library. When you ask a question, Legends Library searches that figure’s approved sources for relevant passages, pulls the strongest evidence, and builds an answer from those materials.",
  },
  {
    heading: "Some questions have direct evidence. Others require interpretation.",
    body: "If MLK wrote directly about nonviolence, civil disobedience, poverty, or racial justice, the answer can lean heavily on direct sources. If you ask what MLK would think about a modern movement, platform, politician, or event, the answer must say when it is making an inference. That is the difference between a hot take and a hallucination.",
  },
  {
    heading: "Every answer is built to show:",
    body: "Primary-source citations · Confidence level · Direct evidence vs. modern inference · Relevant counter-evidence when available · A warning when the source record is thin",
  },
];

const steps = [
  {
    title: "Ask the Question",
    body: "Choose a figure and ask about a modern controversy, historical debate, moral question, or personal issue.",
  },
  {
    title: "Search the Source Library",
    body: "The system searches that figure's approved source database for relevant speeches, letters, writings, interviews, and records.",
  },
  {
    title: "Pull the Evidence",
    body: "The strongest passages are selected and organized around the issue you asked about.",
  },
  {
    title: "Build the Take",
    body: "AI generates a clear answer while separating direct evidence from reasonable interpretation.",
  },
  {
    title: "Verify the Claims",
    body: "A second pass checks whether the answer is actually supported by the cited sources and whether the confidence level is fair.",
  },
  {
    title: "Deliver the Take",
    body: "You get the answer, citations, confidence label, and notes where the evidence is limited.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="font-display text-5xl font-bold leading-tight text-ink">
            How Legends Library Works
          </h1>
          <p className="mt-3 font-display text-lg italic text-gold-dark">
            Bold answers. Cold sources.
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-sub">
            Anyone can make a chatbot pretend to be MLK, Hamilton, or Churchill.
            That is not the point. Legends Library starts with what they
            actually said — speeches, letters, books, interviews, and verified
            writings — then uses AI to reconstruct how their documented ideas
            might apply to today&apos;s most controversial questions.
          </p>
          <Link
            href="/figures"
            className="mt-8 inline-block rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            See It In Action →
          </Link>
        </div>
      </section>

      {/* What makes this different */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center font-display text-3xl font-bold tracking-wide text-ink">
          We Don&apos;t Make History Talk from Thin Air
        </h2>
        <div className="mt-10 space-y-10">
          {differentiators.map((item) => (
            <div key={item.heading}>
              <h3 className="font-display text-xl font-bold text-gold-dark">
                {item.heading}
              </h3>
              <p className="mt-3 leading-relaxed text-sub">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6-step process */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center font-display text-3xl font-bold text-ink">
            Our 6-Step Process
          </h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {steps.map((step, i) => (
              <li key={step.title} className="text-center">
                <span className="font-display text-2xl font-bold text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-snug text-sub">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bottom section */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-ink">
            Every Question Gets a Response — Not Always a Confident One
          </h2>
          <p className="mt-4 text-sub">
            If the source record is strong, Legends Library gives a stronger
            answer. If the source record is weak, the answer should say so.
          </p>
          <p className="mt-4 text-sub">
            The goal is not to make history agree with us. The goal is to make
            history argue with us — with receipts.
          </p>
        </div>
      </section>
    </>
  );
}
