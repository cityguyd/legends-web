import { notFound } from "next/navigation";
import Link from "next/link";
import { ChatThread } from "@/components/chat/ChatThread";
import { Sidebar } from "@/components/chat/Sidebar";
import { listConversations } from "@/lib/actions/conversations";
import { getFigureBySlug, isLive } from "@/lib/marketing/data";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ figureSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props) {
  const { figureSlug } = await params;
  const figure = await getFigureBySlug(figureSlug);
  if (!figure) return { title: "Figure not found — Legends Library" };
  return {
    title: `Ask ${figure.name} — Legends Library`,
    description: `Chat with ${figure.name} — answers grounded in their primary sources.`,
  };
}

export default async function ChatPage({ params, searchParams }: Props) {
  const [{ figureSlug }, search] = await Promise.all([params, searchParams]);

  const figure = await getFigureBySlug(figureSlug);
  if (!figure) notFound();

  // Not yet live — show a "Going Live Soon" holding page instead of redirecting.
  if (!isLive(figure) || !figure.min_corpus_ok) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
        <div className="max-w-md">
          <span className="inline-block rounded-full border border-gold/40 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
            Going Live Soon
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">
            {figure.name} is almost ready
          </h1>
          <p className="mt-3 text-sub">
            We&apos;re finishing up {figure.name}&apos;s source library to make sure
            every answer is grounded in their actual words. Check back soon.
          </p>
          <Link
            href="/figures"
            className="mt-8 inline-block rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            Browse Live Figures →
          </Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [conversations, profileResult] = user
    ? await Promise.all([
        listConversations(20),
        supabase
          .from("profiles")
          .select("tier")
          .eq("id", user.id)
          .maybeSingle(),
      ])
    : [[], null];
  // profiles.tier is the only source of truth for access (written by webhook).
  const isPro = profileResult?.data?.tier === "pro";

  // ?q= prefills the composer (dashboard links here in Task 15); never auto-sent.
  const initialQuestion =
    typeof search.q === "string" && search.q.trim().length > 0
      ? search.q
      : undefined;

  return (
    <div className="flex h-screen bg-bg text-ink">
      <Sidebar
        conversations={conversations}
        isSignedIn={Boolean(user)}
        isPro={isPro}
      />
      <ChatThread
        figure={{
          slug: figure.slug,
          name: figure.name,
          era: figure.era,
          tagline: figure.tagline,
          portraitUrl: figure.portrait_url,
        }}
        isSignedIn={Boolean(user)}
        isPro={isPro}
        showVoiceToggle={figure.hasHistoricalVoice}
        initialQuestion={initialQuestion}
      />
    </div>
  );
}
