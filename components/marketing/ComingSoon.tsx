import Link from "next/link";

/**
 * Shared "Feature Coming Soon" block (V2 spec — used for Debates, Council,
 * and any not-yet-live surface). Body names the specific feature.
 */
export function ComingSoon({ feature }: { feature: string }) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-5xl font-bold text-ink">
        Feature Coming Soon
      </h1>
      <p className="mt-4 font-display text-lg italic text-gold-dark">
        This part of Legends Library is being built.
      </p>
      <p className="mx-auto mt-6 max-w-md leading-relaxed text-sub">
        We&apos;re starting with source-grounded single-figure answers first.{" "}
        {feature}, and other modes are coming soon.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/figures"
          className="rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
        >
          Ask a Bold Question →
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:border-gold"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
