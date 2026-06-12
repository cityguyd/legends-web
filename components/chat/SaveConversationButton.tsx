"use client";

import { useState, useTransition } from "react";
import { saveConversation } from "@/lib/actions/conversations";
import type { ChatMessage } from "@/lib/chat/useChatStream";
import { LimitModal } from "./LimitModal";

/**
 * "Save conversation" affordance for signed-in users.
 * Calls the saveConversation server action with the current thread;
 * a save-cap result opens the existing LimitModal upsell.
 */
export function SaveConversationButton({
  figureSlug,
  messages,
}: {
  figureSlug: string;
  messages: ChatMessage[];
}) {
  const [pending, startTransition] = useTransition();
  // Length of the thread at last successful save — new messages re-enable.
  const [savedLength, setSavedLength] = useState<number | null>(null);
  const [capOpen, setCapOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const saved = savedLength === messages.length;

  function handleSave() {
    setFailed(false);
    setSessionExpired(false);
    startTransition(async () => {
      const result = await saveConversation({
        figureSlug,
        title: "",
        messages: messages.map((m) => ({
          role: m.role,
          text: m.text,
          citations: m.citations,
          confidence: m.confidence,
        })),
      });
      if (result.ok) {
        setSavedLength(messages.length);
      } else if (result.reason === "save-cap") {
        setCapOpen(true);
      } else if (result.reason === "unauthenticated") {
        setSessionExpired(true);
      } else {
        setFailed(true);
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2 self-end">
        {sessionExpired && (
          <span className="text-xs text-sub">
            Session expired — please log in again
          </span>
        )}
        {failed && (
          <span className="text-xs text-sub">Couldn’t save — try again</span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || saved}
          className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-sub transition-colors hover:border-gold hover:text-ink disabled:cursor-default disabled:opacity-70"
        >
          {saved ? "Saved ✓" : pending ? "Saving…" : "Save conversation"}
        </button>
      </div>

      <LimitModal
        kind="save-cap"
        open={capOpen}
        onClose={() => setCapOpen(false)}
      />
    </>
  );
}
