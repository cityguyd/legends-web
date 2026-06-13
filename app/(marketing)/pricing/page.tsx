import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Pricing — Legends Library",
  description:
    "Go beyond the basics. Get unlimited access to powerful tools, deeper analysis, and every figure in the library.",
};

const freeFeatures = [
  "6 questions per day",
  "Access to all live figures",
  "Source citations with every answer",
  "Save up to 5 conversations",
  "Standard response time",
];

const premiumFeatures = [
  "Unlimited questions*",
  "Historical Council (multi-figure answers)",
  "Debate Mode (figures argue it out)",
  "Save unlimited conversations",
  "Export to PDF",
  "Priority response time",
  "Early access to new features",
  "New figures added regularly",
];

const premiumHighlights = [
  {
    title: "Unlimited Questions",
    body: "Ask anything, as often as you like — no daily cap on your curiosity.",
  },
  {
    title: "Historical Council",
    body: "Get multiple figures' perspectives on one question, side by side.",
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
            Unlock Deeper Historical Insight
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-sub">
            Go beyond the basics. Get unlimited access to powerful tools,
            deeper analysis, and every figure in the library.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center font-display text-3xl font-bold text-ink">
          Choose Your Plan
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-8">
            <h3 className="font-display text-2xl font-bold text-ink">Free</h3>
            <p className="mt-1 text-sm text-sub">Great for getting started.</p>
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
              Get Started Free
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
              For serious learners and curious minds.
            </p>
            <p className="mt-5">
              <span className="font-display text-5xl font-bold text-ink">
                $5
              </span>
              <span className="text-sub">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-sub">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden="true" className="text-gold">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/api/stripe/checkout"
              className="mt-8 block rounded-lg bg-gold px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Go Premium
            </a>
            <p className="mt-3 text-center text-xs text-sub">
              Cancel anytime.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-sub">
          *Unlimited is subject to fair use. Generous daily bounds protect the
          service from abuse — normal human curiosity will never hit them.
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

      {/* Privacy strip */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6 py-12 text-center">
          <h2 className="font-display text-xl font-bold text-ink">
            Your Data. Your Privacy. Always.
          </h2>
          <p className="text-sm text-sub">
            We never sell your data. Your conversations are private and secure.
          </p>
          <p className="mt-2 rounded-full border border-gold px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
            14-Day Money-Back Guarantee
          </p>
        </div>
      </section>
    </>
  );
}
