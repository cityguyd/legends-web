"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="font-display text-8xl font-bold text-gold opacity-40">500</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-sub">
        An unexpected error occurred. You can try again, or return to the
        homepage.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-ink transition-colors hover:border-gold"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}
