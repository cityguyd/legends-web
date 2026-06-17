import Link from "next/link";
import type { Metadata } from "next";
import {
  getSharedConversation,
} from "@/lib/actions/conversations";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getSharedConversation(id);
  if (result.kind !== "ok") {
    return { title: "Shared Conversation — Legends Library" };
  }
  return {
    title: `${result.data.title} — Legends Library`,
    description: `A conversation with ${result.data.figureName ?? "a historical figure"}, grounded in primary sources.`,
  };
}

export default async function SharedConversationPage({ params }: Props) {
  const { id } = await params;
  const result = await getSharedConversation(id);

  if (result.kind !== "ok") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="font-display text-2xl font-bold text-ink">
          Conversation not available
        </p>
        <p className="mt-3 text-sub">
          This conversation is not available or has not been shared.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
        >
          Go home
        </Link>
      </main>
    );
  }

  const { title, figureName, figureSlug, createdAt, messages } = result.data;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {/* Header */}
      <div className="rounded-xl bg-card border border-border px-6 py-6 mb-8">
        <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
        {figureName && (
          <p className="mt-1 text-sm font-semibold text-gold-dark">
            with {figureName}
          </p>
        )}
        {formattedDate && (
          <p className="mt-1 text-xs text-sub">{formattedDate}</p>
        )}
        <p className="mt-3 rounded-lg border border-border bg-surface px-4 py-2 text-xs text-sub italic">
          AI reconstruction grounded in primary sources — not the real person.
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-5">
        {messages.map((message, i) => {
          const isUser = message.role === "user";
          return (
            <div key={i} className={isUser ? "" : ""}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sub">
                {isUser ? "Question" : (figureName ?? "Figure")}
                {!isUser && message.confidence && (
                  <span className="ml-2 rounded-full border border-gold/40 bg-card px-2 py-0.5 text-xs font-normal normal-case tracking-normal text-gold-dark">
                    {message.confidence} confidence
                  </span>
                )}
              </p>
              <div
                className={
                  isUser
                    ? "rounded-xl border border-border bg-surface px-5 py-4 text-sm text-ink"
                    : "rounded-xl border border-gold/30 bg-card px-5 py-4 text-sm text-ink"
                }
              >
                {message.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl border border-border bg-card px-6 py-6 text-center">
        <p className="font-display text-lg font-bold text-ink">
          Ask your own question
        </p>
        <p className="mt-1 text-sm text-sub">
          Explore history through conversations with figures who shaped it.
        </p>
        <Link
          href={figureSlug ? `/figures/${figureSlug}` : "/figures"}
          className="mt-4 inline-block rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
        >
          {figureName ? `Talk to ${figureName} →` : "Meet the figures →"}
        </Link>
      </div>

      {/* Branding */}
      <p className="mt-8 text-center text-xs text-sub">
        Powered by{" "}
        <Link href="/" className="hover:underline">
          Legends Library
        </Link>{" "}
        · legendslibrary.ai
      </p>
    </main>
  );
}
