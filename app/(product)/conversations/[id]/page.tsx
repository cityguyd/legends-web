import { notFound, redirect } from "next/navigation";
import { ChatThread } from "@/components/chat/ChatThread";
import { getConversationForResume } from "@/lib/actions/conversations";
import { getFigureBySlug, isLive } from "@/lib/marketing/data";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ResumeConversationPage({ params }: Props) {
  const { id } = await params;
  const result = await getConversationForResume(id);
  if (result.kind === "unauthorized") redirect(`/login?next=/conversations/${id}`);
  if (result.kind !== "ok") notFound();

  const figure = await getFigureBySlug(result.data.figureSlug);
  if (!figure || !isLive(figure) || !figure.min_corpus_ok) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("tier").eq("id", user.id).maybeSingle()
    : { data: null };
  const isPro = profile?.tier === "pro";

  return (
    <div className="flex h-screen bg-bg text-ink">
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
        initialMessages={result.data.messages}
        conversationId={result.data.conversationId}
      />
    </div>
  );
}
