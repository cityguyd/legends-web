import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "How it Works — Legends Library",
  description:
    "We don't put words in dead people's mouths. We find the words they already said.",
};

const differentiators = [
  {
    heading:
      "We don't put words in dead people's mouths. We find the words they already said.",
    body: "Every figure in Legends Library is built from primary sources: letters, speeches, books, interviews, testimony, scripture, journals, and other original records. We don't start with an answer. We start with evidence. For every figure, we maintain a source library containing the documents used to generate answers. If a source is found to be unreliable, it gets removed and any affected answers are updated.",
  },
  {
    heading: "Then we let the documents do the talking.",
    body: "When you ask a question, our system searches thousands of source passages to find the ones most relevant to what you're asking. This isn't AI guessing — it's evidence first. We find the actual passages from the figure's own letters, speeches, books, and writings, and build the answer from those passages. The figure speaks from evidence, not imagination.",
  },
  {
    heading: "We're honest about what we don't know.",
    body: "Not every question has a clean answer in the historical record. That's why every response carries a confidence label. Strong means we found direct evidence — a quote, a position, a documented stance. Inferred means the evidence points in a direction but isn't explicit — the figure will tell you so, and explain their reasoning. Refused means there's no honest basis for an answer, and the figure says that too, in character. We'd rather give you a thoughtful \"I cannot speak to this honestly\" than a confident hallucination.",
  },
  {
    heading: "Every question gets an answer — and an honest label.",
    body: "Our figures will engage with any question, including questions about events that postdate their lives. That's the whole point: applying a historical mind to today's world. What changes is the confidence label. When a question is grounded in documented evidence, you get a high-confidence response with citations. When it requires extending the figure's reasoning to new terrain, you get a medium or low confidence response that tells you exactly that — and explains the inference. A clearly-labeled interpretation is more useful than a refusal. We'd rather tell you 'here is how MLK's documented worldview applies to this question, with low confidence' than leave you without the perspective entirely.",
  },
  {
    heading: "What you're getting — and what you're not.",
    body: "Legends Library is a research and perspective tool, not a historical authority. AI-generated responses are grounded in primary sources but are not infallible interpretations. Historians, theologians, and scholars may disagree — and that's the point. These are the most defensible takes we can construct from the evidence. Treat them the way you'd treat a well-sourced opinion piece: seriously, but not as gospel. Unless it's Jesus. Then, well, you decide.",
  },
];

const steps = [
  {
    title: "Ask a Question",
    body: "You ask any question about today's world.",
  },
  {
    title: "Search Sources",
    body: "We search that figure's primary source library for relevant passages.",
  },
  {
    title: "Extract Evidence",
    body: "We pull the most relevant passages and analyze their meaning.",
  },
  {
    title: "Build Response",
    body: "Our system constructs a response from the evidence, separating direct quotes from inference.",
  },
  {
    title: "Verify & Fact-Check",
    body: "A second verification layer checks every claim, quote, and citation.",
  },
  {
    title: "Deliver Answer",
    body: "You get a clear answer, with citations and a confidence level showing how strong the evidence is.",
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
            Hot takes. Cold sources.
          </p>
          <p className="mx-auto mt-5 max-w-md text-lg text-sub">
            We don&apos;t put words in dead people&apos;s mouths. We find the
            words they already said.
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
          What Makes This Different?
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
    </>
  );
}
