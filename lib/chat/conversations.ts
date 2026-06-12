import type { SupabaseClient } from "@supabase/supabase-js";
import type { SidebarConversation } from "@/components/chat/Sidebar";

/**
 * Reads the signed-in user's saved conversations for the chat sidebar.
 *
 * Interim direct read — Task 15 introduces proper server actions
 * (lib/actions/conversations.ts) and will supersede this. Defensive on
 * purpose: RLS scopes rows to the owner, and the conversations table may
 * not exist yet on fresh databases (known migration 003 issue), so any
 * error degrades to an empty list. Only columns guaranteed by migration
 * 003 (`title`) plus conventional `id`/`created_at` are selected.
 */
export async function listConversationSummaries(
  supabase: SupabaseClient
): Promise<SidebarConversation[]> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return [];
    return (data ?? []).flatMap((row) => {
      const r = row as Record<string, unknown>;
      if (typeof r.id !== "string") return [];
      return [
        {
          id: r.id,
          title:
            typeof r.title === "string" && r.title.length > 0
              ? r.title
              : "Untitled conversation",
          createdAt: typeof r.created_at === "string" ? r.created_at : null,
        },
      ];
    });
  } catch {
    return [];
  }
}
