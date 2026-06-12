import Link from "next/link";
import { redirect } from "next/navigation";
import { AskBar } from "@/components/dashboard/AskBar";
import { ProductHeader } from "@/components/product/ProductHeader";
import { listConversations } from "@/lib/actions/conversations";
import { getFigures, isLive, type Figure } from "@/lib/marketing/data";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard — Legends Library",
};

const QUICK_PICK_COUNT = 8;

function greetingName(user: {
  user_metadata?: Record<string, unknown>;
  email?: string;
}): string {
  const meta = user.user_metadata ?? {};
  if (typeof meta.display_name === "string" && meta.display_name.trim()) {
    return meta.display_name.trim();
  }
  if (typeof meta.full_name === "string" && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  return user.email?.split("@")[0] ?? "friend";
}

function QuickPickCard({ figure }: { figure: Figure }) {
  const live = isLive(figure);
  return (
    <Link
      href={live ? `/chat/${figure.slug}` : `/figures/${figure.slug}`}
      className="relative flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-gold"
    >
      <span className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-gold/40 bg-card">
        {figure.portrait_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={figure.portrait_url}
            alt=""
            className={`size-full object-cover ${live ? "" : "opacity-60 grayscale"}`}
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center font-display text-lg text-gold"
          >
            {figure.name.charAt(0)}
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">
          {figure.name}
        </span>
        <span className="block truncate text-xs text-sub">
          {live ? (figure.era ?? "Ask anything") : "Coming Soon"}
        </span>
      </span>
    </Link>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Proxy already guards /dashboard — this is defense in depth.
  if (!user) redirect("/login?next=/dashboard");

  const [figures, conversations] = await Promise.all([
    getFigures(),
    listConversations(5),
  ]);
  const liveFigures = figures.filter(isLive);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <ProductHeader />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-display text-3xl font-bold text-ink">
          Welcome back, {greetingName(user)}
        </h1>
        <p className="mt-1 text-sub">What would you like to ask?</p>

        <div className="mt-5">
          <AskBar
            figures={liveFigures.map(({ slug, name }) => ({ slug, name }))}
          />
        </div>

        {/* Figure quick picks (wave-gated) */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink">
            Jump back in
          </h2>
          {figures.length === 0 ? (
            <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-sub">
              The library is being stocked. New figures arrive soon.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {figures.slice(0, QUICK_PICK_COUNT).map((figure) => (
                <li key={figure.slug}>
                  <QuickPickCard figure={figure} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent saved conversations */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold text-ink">
              Recent conversations
            </h2>
            <Link
              href="/conversations"
              className="text-sm font-semibold text-gold-dark hover:underline"
            >
              View all →
            </Link>
          </div>
          {conversations.length === 0 ? (
            <p className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-sub">
              No saved conversations yet. Ask a question and hit “Save
              conversation” to keep it here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
              {conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {conversation.title}
                    </p>
                    <p className="mt-0.5 text-xs text-sub">
                      {conversation.figureName ?? "Unknown figure"}
                      {conversation.createdAt &&
                        ` · ${new Date(conversation.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  {conversation.figureSlug && (
                    <Link
                      href={`/chat/${conversation.figureSlug}`}
                      className="shrink-0 text-sm font-semibold text-gold-dark hover:underline"
                    >
                      Continue →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
