import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductHeader } from "@/components/product/ProductHeader";
import { ShareButton } from "@/components/product/ShareButton";
import {
  deleteConversation,
  listConversations,
} from "@/lib/actions/conversations";
import { FREE_SAVE_CAP } from "@/lib/conversations/shared";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Your Conversations — Legends Library",
};

export default async function ConversationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Proxy already guards /conversations — this is defense in depth.
  if (!user) redirect("/login?next=/conversations");

  const [conversations, { data: profile }] = await Promise.all([
    listConversations(),
    supabase.from("profiles").select("tier").eq("id", user.id).maybeSingle(),
  ]);
  const isPro = profile?.tier === "pro";

  return (
    <div className="min-h-screen bg-bg text-ink">
      <ProductHeader />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold text-ink">
            Your Conversations
          </h1>
          <a
            href="/conversations/export"
            download
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-gold"
          >
            Export all conversations (JSON)
          </a>
        </div>

        {!isPro && (
          <p className="mt-3 inline-block rounded-full border border-gold/40 bg-card px-3 py-1 text-xs font-medium text-sub">
            {Math.min(conversations.length, FREE_SAVE_CAP)} of {FREE_SAVE_CAP}{" "}
            free saves used —{" "}
            <Link href="/pricing" className="text-gold-dark hover:underline">
              upgrade for unlimited
            </Link>
          </p>
        )}

        {conversations.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-surface p-10 text-center text-sub">
            No saved conversations yet. Ask a question and hit “Save
            conversation” to keep it here.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-border rounded-xl border border-border bg-surface">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
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
                <div className="flex shrink-0 items-center gap-4">
                  {conversation.figureSlug && (
                    <Link
                      href={`/chat/${conversation.figureSlug}`}
                      className="text-sm font-semibold text-gold-dark hover:underline"
                    >
                      Continue →
                    </Link>
                  )}
                  <ShareButton
                    conversationId={conversation.id}
                    initialIsShared={conversation.isShared}
                  />
                  <a
                    href={`/conversations/${conversation.id}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-sub hover:text-gold-dark hover:underline"
                  >
                    PDF
                  </a>
                  <form action={deleteConversation.bind(null, conversation.id)}>
                    <button
                      type="submit"
                      aria-label={`Delete “${conversation.title}”`}
                      className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-sub transition-colors hover:border-red-300 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
