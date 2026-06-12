"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SidebarConversation } from "@/lib/chat/conversations";

export type { SidebarConversation };

const FREE_SAVE_CAP = 5;

function PanelContent({
  conversations,
  isSignedIn,
}: {
  conversations: SidebarConversation[];
  isSignedIn: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <h2 className="font-display text-lg font-bold text-ink">Conversations</h2>

      {isSignedIn ? (
        <>
          {/* Tier detection arrives in Task 15/16 — free cap shown for all. */}
          {/* TODO(task-15): tier-aware cap */}
          <p className="text-xs text-sub">
            {Math.min(conversations.length, FREE_SAVE_CAP)} of {FREE_SAVE_CAP} saved
          </p>
          {conversations.length === 0 ? (
            <p className="rounded-lg border border-border bg-card px-3 py-4 text-sm text-sub">
              No saved conversations yet. Ask your first question to get
              started.
            </p>
          ) : (
            <ul className="flex flex-col gap-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <li
                  key={conversation.id}
                  className="rounded-lg px-3 py-2"
                >
                  <p className="truncate text-sm font-medium text-ink">
                    {conversation.title}
                  </p>
                  {conversation.createdAt && (
                    <p className="mt-0.5 text-xs text-sub">
                      {new Date(conversation.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-gold/40 bg-card p-4">
          <p className="font-display text-sm font-bold text-ink">
            Save your conversations
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sub">
            Sign up free to save conversations and get 6 questions a day.
          </p>
          <Link
            href="/signup"
            className="mt-3 inline-block rounded-lg bg-gold px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gold-dark"
          >
            Sign Up Free
          </Link>
        </div>
      )}

      <div className="mt-auto border-t border-border pt-4">
        <Link
          href="/figures"
          className="text-sm font-semibold text-gold-dark hover:underline"
        >
          ← Switch figure
        </Link>
      </div>
    </div>
  );
}

export function Sidebar({
  conversations,
  isSignedIn,
}: {
  conversations: SidebarConversation[];
  isSignedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus to close button when drawer opens; return to trigger on close.
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-surface lg:block">
        <PanelContent conversations={conversations} isSignedIn={isSignedIn} />
      </aside>

      {/* Mobile drawer toggle — floats above the composer */}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label="Open conversations"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-40 rounded-full border border-border bg-surface p-3 text-ink shadow-md lg:hidden"
      >
        ☰
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Conversations"
        >
          <button
            type="button"
            aria-label="Close conversations"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-xl">
            <div className="flex justify-end px-3 pt-3">
              <button
                ref={closeRef}
                type="button"
                aria-label="Close conversations"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-ink"
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <PanelContent
                conversations={conversations}
                isSignedIn={isSignedIn}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
