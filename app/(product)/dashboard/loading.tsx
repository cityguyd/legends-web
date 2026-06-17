export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* ProductHeader skeleton */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <div className="h-5 w-32 animate-pulse rounded bg-border" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Greeting */}
        <div className="h-9 w-64 animate-pulse rounded bg-border" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-border" />

        {/* AskBar placeholder */}
        <div className="mt-5 h-12 w-full animate-pulse rounded-xl bg-border" />

        {/* Figure quick picks */}
        <section className="mt-10">
          <div className="h-7 w-36 animate-pulse rounded bg-border" />
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
              >
                <div className="size-12 shrink-0 animate-pulse rounded-full bg-border" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-border" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-border" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent conversations */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <div className="h-7 w-48 animate-pulse rounded bg-border" />
            <div className="h-4 w-16 animate-pulse rounded bg-border" />
          </div>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-border" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-border" />
                </div>
                <div className="h-3.5 w-16 shrink-0 animate-pulse rounded bg-border" />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
