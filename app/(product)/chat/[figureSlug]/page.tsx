import { notFound, redirect } from "next/navigation";
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
  // Chat is open only for launched figures with a ready corpus.
  if (!isLive(figure) || !figure.min_corpus_ok) {
    redirect(`/figures/${figure.slug}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const conversations = user ? await listConversations(20) : [];

  // ?q= prefills the composer (dashboard links here in Task 15); never auto-sent.
  const initialQuestion =
    typeof search.q === "string" && search.q.trim().length > 0
      ? search.q
      : undefined;

  return (
    <div className="flex h-screen bg-bg text-ink">
      <Sidebar conversations={conversations} isSignedIn={Boolean(user)} />
      <ChatThread
        figure={{
          slug: figure.slug,
          name: figure.name,
          era: figure.era,
          tagline: figure.tagline,
          portraitUrl: figure.portrait_url,
        }}
        isSignedIn={Boolean(user)}
        showVoiceToggle={figure.hasHistoricalVoice}
        initialQuestion={initialQuestion}
      />
    </div>
  );
}
