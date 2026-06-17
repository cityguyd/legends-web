export default function ConversationsLoading() {
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
        {/* Heading + export button row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="h-9 w-56 animate-pulse rounded bg-border" />
          <div className="h-9 w-48 animate-pulse rounded-lg bg-border" />
        </div>

        {/* Free saves badge */}
        <div className="mt-3 h-6 w-56 animate-pulse rounded-full bg-border" />

        {/* Conversation list */}
        <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 animate-pulse rounded bg-border" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-border" />
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="h-3.5 w-16 animate-pulse rounded bg-border" />
                <div className="h-6 w-14 animate-pulse rounded-md bg-border" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
