import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Pricing",
  description:
    "Start free. Unlock the full debate when you're ready. Ask bold questions, get cited answers, and explore how history's biggest minds might argue about today's biggest issues.",
  openGraph: {
    title: 'Pricing — Legends Library',
    url: '/pricing',
  },
  twitter: { title: 'Pricing — Legends Library' },
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Legends Library Premium",
    "description": "Unlimited questions, saved conversations, and full access to the growing library of historical figures.",
    "offers": {
      "@type": "Offer",
      "price": "5.00",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "5.00",
        "priceCurrency": "USD",
        "billingDuration": "P1M",
      },
      "availability": "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
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
              <div key={item.title} className="flex flex-col items-center text-center">
                <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3 size-5 shrink-0" aria-hidden="true">
                  <path d="M4 10a6 6 0 1012 0A6 6 0 004 10z" stroke="#D59E3C" strokeWidth="1.5"/>
                  <path d="M7 10l2 2 4-4" stroke="#D59E3C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3 className="font-display text-lg font-bold text-gold-dark">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-sub">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teams & Organizations */}
      <section className="border-t border-border bg-bg">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-ink">
              For Teams &amp; Organizations
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sub">
              One plan for your whole church, small group, classroom, or
              homeschool co-op. Every seat gets unlimited access; an admin
              manages the roster.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Group */}
            <div className="flex flex-col rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-display text-2xl font-bold text-ink">Group</h3>
              <p className="mt-1 text-sm text-sub">
                For small groups, classrooms, and ministries.
              </p>
              <p className="mt-5">
                <span className="font-display text-5xl font-bold text-ink">
                  $39
                </span>
                <span className="text-sub">/month</span>
                <span className="ml-2 text-sm text-sub">· up to 10 seats</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-sub">
                {[
                  "Everything in Premium, per seat",
                  "10 seats with admin roster management",
                  "Invite & remove members by email",
                  "Annual billing available ($320/yr)",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="text-gold">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:support@legendslibrary.ai?subject=Group%20plan%20(10%20seats)"
                className="mt-8 block rounded-lg border border-gold px-6 py-3 text-center font-semibold text-gold-dark transition-colors hover:bg-card"
              >
                Contact us to set up
              </a>
            </div>

            {/* Institution */}
            <div className="flex flex-col rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-display text-2xl font-bold text-ink">
                Institution
              </h3>
              <p className="mt-1 text-sm text-sub">
                For schools, seminaries, and larger organizations.
              </p>
              <p className="mt-5">
                <span className="font-display text-5xl font-bold text-ink">
                  $149
                </span>
                <span className="text-sub">/month</span>
                <span className="ml-2 text-sm text-sub">· up to 50 seats</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-sub">
                {[
                  "Everything in Group, for up to 50 seats",
                  "Roster management & usage reports",
                  "Annual billing available ($1,200/yr)",
                  "Onboarding support",
                ].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="text-gold">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:support@legendslibrary.ai?subject=Institution%20plan%20(50%20seats)"
                className="mt-8 block rounded-lg border border-gold px-6 py-3 text-center font-semibold text-gold-dark transition-colors hover:bg-card"
              >
                Contact us to set up
              </a>
            </div>
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
