import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Legends Library",
  description:
    "See how Legends Library builds historically accurate answers from primary sources.",
};

const steps = [
  {
    title: "Your Question",
    body: "You ask about history, policy, philosophy, or human nature — anything a historical mind could speak to.",
  },
  {
    title: "Source Selection",
    body: "We identify which primary sources, letters, speeches, and writings are most relevant to your specific question.",
  },
  {
    title: "Evidence Mining",
    body: "Key passages are extracted and ranked by relevance, authenticity, and historical significance.",
  },
  {
    title: "Perspective Building",
    body: "The figure's documented views, context, and known positions are synthesized into a coherent perspective.",
  },
  {
    title: "Verification",
    body: "Claims are cross-referenced against the historical record. Speculation is flagged. Sources are cited.",
  },
  {
    title: "Delivered Answer",
    body: "You receive a response in the figure's authentic voice, grounded in what they actually believed and said.",
  },
];

const stepIcons = [
  // Step 1: quill nib
  <svg key="quill" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8" aria-hidden="true">
    <path d="M26 4C20 8 14 14 10 22L8 28l6-2c8-4 14-10 18-16L26 4z" stroke="#D59E3C" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M10 22c2-2 4-3 6-4" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 28l3-3" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
  // Step 2: open book
  <svg key="book" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8" aria-hidden="true">
    <path d="M16 8v18M6 6c0 0 3-1 10 2M26 6c0 0-3-1-10 2" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 8c0-1 1-2 2-2l10 2 10-2c1 0 2 1 2 2v14c0 1-1 2-2 2l-10-2-10 2c-1 0-2-1-2-2V8z" stroke="#D59E3C" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>,
  // Step 3: magnifying glass
  <svg key="magnify" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8" aria-hidden="true">
    <circle cx="14" cy="14" r="8" stroke="#D59E3C" strokeWidth="1.5"/>
    <path d="M20 20l7 7" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 14h6M14 11v6" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
  // Step 4: scroll with seal
  <svg key="scroll" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8" aria-hidden="true">
    <path d="M8 6h16v20H8z" stroke="#D59E3C" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M8 6c0-2-3-2-3 0v20c0 2 3 2 3 0M24 6c0-2 3-2 3 0v20c0 2-3 2-3 0" stroke="#D59E3C" strokeWidth="1.5"/>
    <path d="M11 12h10M11 16h10M11 20h6" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="21" cy="21" r="3" stroke="#D59E3C" strokeWidth="1.5"/>
  </svg>,
  // Step 5: balance scale
  <svg key="scale" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8" aria-hidden="true">
    <path d="M16 6v20M10 26h12" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 10h16" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 10l-4 8h8l-4-8zM24 10l-4 8h8l-4-8z" stroke="#D59E3C" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>,
  // Step 6: torch / flame
  <svg key="torch" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-8" aria-hidden="true">
    <path d="M16 4c0 0-6 5-4 11 1 3 4 5 4 5s3-2 4-5c2-6-4-11-4-11z" stroke="#D59E3C" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M16 20v8M13 28h6" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 12c0 0-2 2-1 4" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
];

export default function HowItWorksPage() {
  return (
    <main>
      {/* Hero */}
      <section
        className="relative flex min-h-[360px] items-start justify-center"
        style={{
          backgroundImage: `url('/images/how-it-works-hero.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        <div className="relative mx-auto max-w-3xl px-6 pt-8 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-white drop-shadow-lg md:text-5xl [text-shadow:0_2px_10px_rgba(0,0,0,0.8)]">
            How It Works
          </h1>
          <p className="translate-y-21 text-lg text-white drop-shadow-lg [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
            Every answer is built from primary sources — letters, speeches, and writings — not trained guesses.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {stepIcons[i]}
                <span className="font-serif text-lg font-semibold text-foreground">{step.title}</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Deep explanation */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-display text-3xl font-bold text-ink">
            Why Primary Sources Matter
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-sub">
            <p>
              Most AI systems are trained to sound authoritative — but Legends Library is built differently. Every answer starts with real historical documents: letters written in the heat of revolution, speeches delivered in moments of crisis, books penned across decades of hard-won experience.
            </p>
            <p>
              We don&apos;t ask a model to imagine what Franklin might say about Bitcoin. We ask it to reason through what Franklin <em>actually wrote</em> about paper money, thrift, credit, and speculation — and then apply that documented worldview to the modern question you asked.
            </p>
            <p>
              The result isn&apos;t a guess. It&apos;s a synthesis: bold, grounded, and fully traceable. Every response includes a confidence label (High, Medium, or Low), a note on whether key claims come from direct evidence or reasoned inference, and citations you can actually check.
            </p>
            <p>
              That means you can push back. You can ask follow-up questions. You can read the sources yourself. Legends Library treats you as someone who wants to think, not just someone who wants an answer.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-card p-8">
            <h3 className="font-display text-xl font-bold text-ink">
              What Makes a Good Question?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-sub">
              The best questions for Legends Library are the ones that feel a little uncomfortable to ask out loud — questions where smart people disagree, where history is genuinely contested, or where the answer depends on whose values you hold. Think: <em>&quot;Would MLK support affirmative action today?&quot;</em> or <em>&quot;Would Theodore Roosevelt have backed military intervention in Ukraine?&quot;</em>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-sub">
              These questions don&apos;t have clean answers. That&apos;s exactly why we built Legends Library — to give you something more honest than a Wikipedia summary and more rigorous than a hot take.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

