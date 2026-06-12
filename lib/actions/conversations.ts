"use server";

/**
 * Server actions for saved conversations (migration 003 schema).
 *
 * RLS scopes every read/write to the signed-in user (own-rows policies on
 * conversations/messages via auth.uid()), so queries here never filter by
 * user_id except where it makes intent explicit. Tier comes from
 * profiles.tier — the only source of truth for access.
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  FREE_SAVE_CAP,
  TITLE_MAX_LENGTH,
  type ConversationSummary,
  type SaveConversationInput,
  type SaveConversationResult,
} from "@/lib/conversations/shared";

// ── Helpers (module-private; not exported — "use server" files may only
//    export async functions) ─────────────────────────────────────────────────

function truncateTitle(text: string): string {
  if (text.length <= TITLE_MAX_LENGTH) return text;
  return text.slice(0, TITLE_MAX_LENGTH - 1).trimEnd() + "…";
}

function deriveTitle(input: SaveConversationInput): string {
  const provided = input.title.trim();
  if (provided) return truncateTitle(provided);
  const firstQuestion = input.messages
    .find((m) => m.role === "user")
    ?.text.trim();
  if (firstQuestion) return truncateTitle(firstQuestion);
  return "Untitled conversation";
}

/** revalidatePath throws outside a request scope (e.g. unit tests) — ignore. */
function safeRevalidate(...paths: string[]) {
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      // Non-fatal: the lists are rendered dynamically on next request anyway.
    }
  }
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

async function getTier(
  supabase: ServerClient,
  userId: string
): Promise<"free" | "pro"> {
  const { data } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .maybeSingle();
  // Missing row or unexpected value → "free" (restrictive default).
  return data?.tier === "pro" ? "pro" : "free";
}

function parseSummaryRow(row: unknown): ConversationSummary | null {
  const r = row as Record<string, unknown> | null;
  if (typeof r?.id !== "string") return null;
  const rawDate = typeof r.created_at === "string" ? r.created_at : null;
  // figures(slug, name) embed: object for a to-one FK, null when figure_id null
  const figure = (r.figures ?? null) as Record<string, unknown> | null;
  return {
    id: r.id,
    title:
      typeof r.title === "string" && r.title.length > 0
        ? r.title
        : "Untitled conversation",
    createdAt:
      rawDate !== null && !Number.isNaN(new Date(rawDate).getTime())
        ? rawDate
        : null,
    figureSlug: typeof figure?.slug === "string" ? figure.slug : null,
    figureName: typeof figure?.name === "string" ? figure.name : null,
  };
}

// ── Actions ──────────────────────────────────────────────────────────────────

export async function saveConversation(
  input: SaveConversationInput
): Promise<SaveConversationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  // Free tier: cap saved conversations at FREE_SAVE_CAP.
  const tier = await getTier(supabase, user.id);
  if (tier !== "pro") {
    const { count, error: countError } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (countError) return { ok: false, reason: "error" };
    if ((count ?? 0) >= FREE_SAVE_CAP) return { ok: false, reason: "save-cap" };
  }

  // Resolve figure_id from slug; a miss saves with null rather than failing.
  const { data: figure } = await supabase
    .from("figures")
    .select("id")
    .eq("slug", input.figureSlug)
    .maybeSingle();
  const figureId = typeof figure?.id === "string" ? figure.id : null;

  const title = deriveTitle(input);

  const { data: conversation, error: insertError } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, figure_id: figureId, title })
    .select()
    .single();
  if (insertError || typeof conversation?.id !== "string") {
    return { ok: false, reason: "error" };
  }

  if (input.messages.length > 0) {
    const rows = input.messages.map((m) => ({
      conversation_id: conversation.id,
      role: m.role,
      text: m.text,
      citations: m.citations ?? null,
      confidence: m.confidence ?? null,
    }));
    const { error: messagesError } = await supabase
      .from("messages")
      .insert(rows);
    if (messagesError) {
      // Don't leave an empty shell behind (cascade removes partial messages).
      await supabase.from("conversations").delete().eq("id", conversation.id);
      return { ok: false, reason: "error" };
    }
  }

  safeRevalidate("/dashboard", "/conversations");
  return { ok: true, id: conversation.id, title };
}

export async function listConversations(
  limit = 50
): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, figures(slug, name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).flatMap((row) => {
    const summary = parseSummaryRow(row);
    return summary ? [summary] : [];
  });
}

export async function deleteConversation(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  // RLS restricts the delete to the owner's rows.
  await supabase.from("conversations").delete().eq("id", id);
  safeRevalidate("/dashboard", "/conversations");
}

/**
 * Full export of the user's saved conversations (all tiers).
 * Returns null when unauthenticated so the route handler can 401.
 */
export async function exportConversations(): Promise<unknown[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("conversations")
    .select(
      "id, title, created_at, figures(slug, name), messages(role, text, citations, confidence, created_at)"
    )
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}
