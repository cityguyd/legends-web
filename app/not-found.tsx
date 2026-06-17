import Link from "next/link";

export const metadata = {
  title: "Page Not Found — Legends Library",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="font-display text-8xl font-bold text-gold opacity-40">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 max-w-md text-sub">
        The question you were looking for may have moved, or never existed.
        History has a way of doing that.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
        >
          Back to Home
        </Link>
        <Link
          href="/figures"
          className="rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:border-gold"
        >
          Browse Figures
        </Link>
      </div>
    </main>
  );
}
