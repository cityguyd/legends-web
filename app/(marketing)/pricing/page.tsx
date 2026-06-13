import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Pricing — Legends Library",
  description:
    "Start free. Unlock the full debate when you&apos;re ready. Ask bold questions, get cited answers, and explore how history&apos;s biggest minds might argue about today&apos;s biggest issues.",
};

const freeFeatures = [
  "6 questions per day",
  "Access to available public figures",
  "Primary-source citations",
  "Confidence labels",
  "Evidence vs. inference notes",
  "Basic chat history",
];

const premiumFeatures = [
  { label: "Unlimited standard questions*", comingSoon: false },
  { label: "Historical Council Mode", comingSoon: true },
  { label: "Debate Mode", comingSoon: true },
  { label: "Saved conversations", comingSoon: false },
  { label: "Shareable answer pages", comingSoon: true },
  { label: "Export cited answers to PDF", comingSoon: true },
  { label: "Priority access to new figures", comingSoon: false },
  { label: "Early access to hot-topic drops", comingSoon: false },
];

const premiumHighlights = [
  {
    title: "Unlimited Questions",
    body: "Ask anything, as often as you like — no daily cap on your curiosity.",
  },
  {
    title: "Historical Council",
    body: "Get multiple figures’ perspectives on one question, side by side.",
  },
  {
    title: "Debate Mode",
    body: "Watch two figures argue a question from their own documented positions.",
  },
  {
    title: "Save & Organize",
    body: "Keep every conversation, organized and searchable, forever.",
  },
  {
    title: "Export to PDF",
    body: "Download cited answers for research, teaching, or sharing.",
  },
  {
    title: "New Figures First",
    body: "New voices and early-access features land in Premium first.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="font-display text-5xl font-bold leading-tight text-ink">
            Choose Your Plan
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-sub">
            Start free. Unlock the full debate when you&apos;re ready.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-base text-sub">
            Ask bold questions, get cited answers, and explore how history&apos;s
            biggest minds might argue about today&apos;s biggest issues.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mt-0 grid gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-8">
            <h3 className="font-display text-2xl font-bold text-ink">Free</h3>
            <p className="mt-1 text-sm text-sub">
              For curious users who want to try Legends Library.
            </p>
            <p className="mt-5">
              <span className="font-display text-5xl font-bold text-ink">
                $0
              </span>
              <span className="text-sub">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-sub">
              {freeFeatures.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden="true" className="text-gold">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 block rounded-lg border border-gold px-6 py-3 text-center font-semibold text-gold-dark transition-colors hover:bg-card"
            >
              Start Free
            </Link>
          </div>

          {/* Premium */}
          <div className="relative flex flex-col rounded-2xl border-2 border-gold bg-surface p-8 shadow-md">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Most Popular
            </span>
            <h3 className="font-display text-2xl font-bold text-ink">
              Premium
            </h3>
            <p className="mt-1 text-sm text-sub">
              For users who want more questions, deeper debates, and full access
              to the library as it grows.
            </p>
            <p className="mt-5">
              <span className="font-display text-5xl font-bold text-ink">
                $5
              </span>
              <span className="text-sub">/month</span>
              <span className="ml-2 inline-block rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold-dark">
                Founding Member Price
              </span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-sub">
              {premiumFeatures.map((f) => (
                <li key={f.label} className="flex gap-2">
                  <span aria-hidden="true" className="text-gold">
                    ✓
                  </span>
                  <span>
                    {f.label}
                    {f.comingSoon && (
                      <span className="ml-1 text-xs text-sub opacity-70">
                        (coming soon)
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="/api/stripe/checkout"
              className="mt-8 block rounded-lg bg-gold px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Upgrade to Premium
            </a>
            <p className="mt-3 text-center text-xs text-sub">Cancel anytime.</p>
          </div>
        </div>

        {/* Fair-use footnote */}
        <p className="mt-6 text-center text-xs text-sub">
          *Unlimited standard questions are subject to fair-use limits.
          High-compute features like Council Mode, Debate Mode, and large exports
          may have generous usage caps to keep the service fast and sustainable.
        </p>
      </section>

      {/* Premium highlights */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center font-display text-3xl font-bold text-ink">
            Everything in Premium, Built for Deeper Insight
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {premiumHighlights.map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="font-display text-lg font-bold text-gold-dark">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-sub">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom trust section */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 py-12 text-center">
          <h2 className="font-display text-xl font-bold text-ink">
            No Fake Certainty. No Empty Answers.
          </h2>
          <p className="text-sm text-sub">
            Every plan includes citations, confidence labels, and
            source-grounded answers. Premium gives you more ways to explore,
            compare, debate, save, and share them.
          </p>
          <p className="mt-2 rounded-full border border-gold px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
            Cancel anytime.
          </p>
        </div>
      </section>
    </>
  );
}
