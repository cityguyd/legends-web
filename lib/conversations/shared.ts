/**
 * Shared conversation types + constants.
 *
 * Lives outside lib/actions/conversations.ts because "use server" modules may
 * only export async functions — constants and types consumed by client
 * components (Sidebar, SaveConversationButton) belong here.
 */

/** Free-tier saved-conversation cap — single source of truth. */
export const FREE_SAVE_CAP = 5;

/** Max characters for an auto-generated conversation title. */
export const TITLE_MAX_LENGTH = 60;

export interface ConversationMessageInput {
  role: "user" | "figure";
  text: string;
  /** Citation payload stored as jsonb — shape owned by the chat client. */
  citations?: unknown;
  confidence?: string;
}

export interface SaveConversationInput {
  figureSlug: string;
  title: string;
  messages: ConversationMessageInput[];
}

export type SaveConversationFailReason =
  | "unauthenticated"
  | "invalid-input"
  | "save-cap"
  | "error";

/**
 * Failure branch carries `id?/title?: undefined` so callers can read
 * `res.title` without narrowing first (the success fields stay typed).
 */
export type SaveConversationResult =
  | { ok: true; id: string; title: string }
  | {
      ok: false;
      reason: SaveConversationFailReason;
      id?: undefined;
      title?: undefined;
    };

/** Row shape for conversation lists (sidebar, dashboard, /conversations). */
export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string | null;
  figureSlug: string | null;
  figureName: string | null;
}

/** What the chat Sidebar needs — a structural subset of ConversationSummary. */
export type SidebarConversation = Pick<
  ConversationSummary,
  "id" | "title" | "createdAt"
>;
